# analyzer/debate_model_trainer.py

import torch
from torch.optim import AdamW
from transformers import AutoModelForSequenceClassification, AutoTokenizer
from transformers import get_linear_schedule_with_warmup
import logging
from pathlib import Path
from tqdm import tqdm
import numpy as np
from typing import Dict, Tuple

from .data_loader import create_data_loaders

logger = logging.getLogger(__name__)

class DebateModelTrainer:
    def __init__(self, config):
        self.config = config
        # 디바이스 설정 (GPU 우선)
        self.device = torch.device(config.device)
        
        # 모델 및 토크나이저 초기화
        self.initialize_model()
    
    def initialize_model(self):
        # KLUE/BERT 기반 모델 로드
        self.model = AutoModelForSequenceClassification.from_pretrained(
            self.config.model_name,
            num_labels=self.config.num_labels  # 5개 감정 클래스
        )
        
        # 토크나이저 로드
        self.tokenizer = AutoTokenizer.from_pretrained(self.config.model_name)
        
        # GPU 설정
        self.model.to(self.device)
        
        # 멀티 GPU 지원
        if torch.cuda.device_count() > 1:
            self.model = torch.nn.DataParallel(self.model)
            
    def train(self, train_path: str, val_path: str = None, start_epoch: int = 0) -> Dict:
        # 데이터 로더 생성
        self.config.batch_size = 64  # 배치 사이즈 증가
        train_loader, val_loader = create_data_loaders(
            self.config,
            self.tokenizer,
            train_path,
            val_path
        )
        
        # 옵티마이저 설정
        optimizer = AdamW(
            self.model.parameters(),
            lr=5e-5,
            weight_decay=0.01
        )
        
        # 스케줄러 설정
        total_steps = len(train_loader) * 2  # 2 에폭
        scheduler = get_linear_schedule_with_warmup(
            optimizer,
            num_warmup_steps=0,
            num_training_steps=total_steps
        )
        
        # Mixed Precision 설정
        scaler = torch.amp.GradScaler(device='cuda', enabled=True)
        
        # 학습 시작
        best_val_loss = float('inf')
        training_stats = []
        
        for epoch in range(start_epoch, 2):
            logger.info(f"Epoch {epoch + 1}/2")
            
            if torch.cuda.is_available():
                torch.cuda.empty_cache()
            
            train_loss = self._train_epoch(train_loader, optimizer, scheduler, scaler)
            val_loss, val_accuracy = self._validate(val_loader)
            
            if val_loss < best_val_loss:
                best_val_loss = val_loss
                self._save_checkpoint(epoch + 1, val_loss, val_accuracy)
            
            training_stats.append({
                'epoch': epoch + 1,
                'train_loss': train_loss,
                'val_loss': val_loss,
                'val_accuracy': val_accuracy
            })
            
            logger.info(f"Train Loss: {train_loss:.4f}")
            logger.info(f"Val Loss: {val_loss:.4f}, Val Accuracy: {val_accuracy:.4f}")
        
        self._save_final_model()
        return training_stats
    
    def _train_epoch(self, train_loader, optimizer, scheduler, scaler) -> float:
        self.model.train()
        total_loss = 0
        
        progress_bar = tqdm(train_loader, desc="Training")
        for batch in progress_bar:
            batch = {k: v.to(self.device) for k, v in batch.items()}
            
            optimizer.zero_grad()
            
            with torch.amp.autocast(device_type='cuda', dtype=torch.float16):
                outputs = self.model(
                    input_ids=batch['input_ids'],
                    attention_mask=batch['attention_mask'],
                    labels=batch['labels']
                )
                loss = outputs.loss
            
            scaler.scale(loss).backward()
            scaler.unscale_(optimizer)
            torch.nn.utils.clip_grad_norm_(self.model.parameters(), 1.0)
            
            scaler.step(optimizer)
            scaler.update()
            scheduler.step()
            
            total_loss += loss.item()
            progress_bar.set_postfix({'loss': f'{loss.item():.4f}'})
            
        return total_loss / len(train_loader)
        
    def _validate(self, val_loader) -> Tuple[float, float]:
        self.model.eval()
        total_loss = 0
        correct_predictions = 0
        total_predictions = 0
        
        with torch.no_grad():
            for batch in tqdm(val_loader, desc="Validating"):
                batch = {k: v.to(self.device) for k, v in batch.items()}
                
                with torch.amp.autocast(device_type='cuda', dtype=torch.float16):
                    outputs = self.model(
                        input_ids=batch['input_ids'],
                        attention_mask=batch['attention_mask'],
                        labels=batch['labels']
                    )
                    
                    total_loss += outputs.loss.item()
                    predictions = torch.argmax(outputs.logits, dim=1)
                    correct_predictions += (predictions == batch['labels']).sum().item()
                    total_predictions += batch['labels'].size(0)
        
        avg_loss = total_loss / len(val_loader)
        accuracy = correct_predictions / total_predictions
        
        return avg_loss, accuracy
        
    def _save_checkpoint(self, epoch: int, val_loss: float, val_accuracy: float):
        checkpoint_path = self.config.checkpoint_path / f"checkpoint_epoch_{epoch}.pt"
        checkpoint_path.parent.mkdir(parents=True, exist_ok=True)
        
        model_state = self.model.module.state_dict() if isinstance(self.model, torch.nn.DataParallel) else self.model.state_dict()
        
        torch.save({
            'epoch': epoch,
            'model_state_dict': model_state,
            'val_loss': val_loss,
            'val_accuracy': val_accuracy
        }, checkpoint_path)
        
        logger.info(f"Saved checkpoint to {checkpoint_path}")
        
    def _save_final_model(self):
        save_path = self.config.model_path
        save_path.mkdir(parents=True, exist_ok=True)
        
        if isinstance(self.model, torch.nn.DataParallel):
            self.model.module.save_pretrained(save_path)
        else:
            self.model.save_pretrained(save_path)
            
        self.tokenizer.save_pretrained(save_path)
        logger.info(f"Saved final model to {save_path}")

    def load_checkpoint(self, checkpoint_path: str) -> int:
        logger.info(f"Loading checkpoint from {checkpoint_path}")
        checkpoint = torch.load(checkpoint_path)
        
        if isinstance(self.model, torch.nn.DataParallel):
            self.model.module.load_state_dict(checkpoint['model_state_dict'])
        else:
            self.model.load_state_dict(checkpoint['model_state_dict'])
            
        start_epoch = checkpoint['epoch']
        logger.info(f"Loaded checkpoint from epoch {start_epoch}")
        return start_epoch

def train_debate_model(config, train_path: str, val_path: str = None, checkpoint_path: str = None):
    trainer = DebateModelTrainer(config)
    
    start_epoch = 0
    if checkpoint_path:
        start_epoch = trainer.load_checkpoint(checkpoint_path)
    
    training_stats = trainer.train(train_path, val_path, start_epoch=start_epoch)
    return training_stats