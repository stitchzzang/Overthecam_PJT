# analyzer/data_loader.py

import torch
from torch.utils.data import Dataset, DataLoader
from transformers import AutoTokenizer
import json
import logging
from pathlib import Path
from typing import List, Dict, Tuple

logger = logging.getLogger(__name__)

class DebateDataset(Dataset):
    def __init__(self, texts: List[str], labels: List[int], tokenizer, max_length: int = 512):
        self.texts = texts
        self.labels = labels
        self.tokenizer = tokenizer
        self.max_length = max_length

    def __len__(self):
        return len(self.labels)

    def __getitem__(self, idx) -> Dict[str, torch.Tensor]:
        text = self.texts[idx]
        label = self.labels[idx]

        encoding = self.tokenizer(
            text,
            truncation=True,
            max_length=self.max_length,
            padding='max_length',
            return_tensors='pt'
        )

        return {
            'input_ids': encoding['input_ids'].squeeze(),
            'attention_mask': encoding['attention_mask'].squeeze(),
            'labels': torch.tensor(label, dtype=torch.long)
        }

def load_debate_data(data_path: str) -> Tuple[List[str], List[int]]:
    try:
        with open(data_path, 'r', encoding='utf-8') as f:
            data = json.load(f)
            
        texts = []
        labels = []
        
        emotion_map = {
            '기쁨': 0,
            '슬픔': 1,
            '분노': 2,
            '불안': 3,
            '중립': 4
        }
        
        for item in data:
            if 'text' in item and 'emotion' in item:
                texts.append(item['text'])
                labels.append(emotion_map[item['emotion']])
                
        # 감정 분포 로깅
        label_counts = {}
        for label in labels:
            label_counts[label] = label_counts.get(label, 0) + 1
        logger.info(f"Loaded {len(texts)} samples from {data_path}")
        logger.info("Emotion Distribution:")
        for label, count in label_counts.items():
            emotion_name = list(emotion_map.keys())[list(emotion_map.values()).index(label)]
            logger.info(f"{emotion_name}: {count}")
        
        return texts, labels
        
    except Exception as e:
        logger.error(f"Error loading data from {data_path}: {str(e)}")
        raise

def create_data_loaders(
    config,
    tokenizer: AutoTokenizer,
    train_path: str,
    val_path: str = None,
    val_split: float = 0.2,
    batch_size: int = None  # 배치 사이즈 파라미터 추가
) -> Tuple[DataLoader, DataLoader]:
    """데이터 로더 생성"""
    
    # 학습 데이터 로드
    train_texts, train_labels = load_debate_data(train_path)
    
    if val_path:
        val_texts, val_labels = load_debate_data(val_path)
    else:
        val_size = int(len(train_texts) * val_split)
        val_texts = train_texts[-val_size:]
        val_labels = train_labels[-val_size:]
        train_texts = train_texts[:-val_size]
        train_labels = train_labels[:-val_size]
    
    # 실제 사용할 배치 사이즈 결정
    actual_batch_size = batch_size if batch_size is not None else config.batch_size
    
    # 데이터셋 생성
    train_dataset = DebateDataset(train_texts, train_labels, tokenizer, config.max_length)
    val_dataset = DebateDataset(val_texts, val_labels, tokenizer, config.max_length)
    
    # 데이터 로더 생성
    train_loader = DataLoader(
        train_dataset,
        batch_size=actual_batch_size,
        shuffle=True,
        num_workers=4
    )
    
    val_loader = DataLoader(
        val_dataset,
        batch_size=actual_batch_size,
        shuffle=False,
        num_workers=4
    )
    
    logger.info(f"Created data loaders - Train: {len(train_loader.dataset)} samples, "
                f"Validation: {len(val_loader.dataset)} samples")
    logger.info(f"Using batch size: {actual_batch_size}")
    
    return train_loader, val_loader