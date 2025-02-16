# 감정분석 로직

import torch
import threading
from transformers import BertTokenizer, BertForSequenceClassification
from typing import Dict, Optional
import logging
from pathlib import Path

from config import BaseConfig

logger = logging.getLogger(__name__)

class EmotionAnalyzer:
    _instance = None
    _lock = threading.Lock()
    
    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super(EmotionAnalyzer, cls).__new__(cls)
        return cls._instance

    def __init__(self, config: BaseConfig = None):
        if not hasattr(self, 'initialized'):
            self.config = config or BaseConfig()
            self.device = torch.device(self.config.device)
            self.initialize_model()
            self.initialized = True

    def initialize_model(self):
        """기존 학습된 모델 로드"""
        try:
            if not self.config.model_path.exists():
                raise ValueError(f"Model path not found: {self.config.model_path}")
            
            # 모델 파일 존재 확인
            required_files = ['config.json', 'tokenizer.json', 'pytorch_model.bin']
            for file in required_files:
                if not (self.config.model_path / file).exists():
                    raise ValueError(f"Required file missing: {file}")
            
            # 토크나이저와 모델 로드
            self.tokenizer = BertTokenizer.from_pretrained(str(self.config.model_path))
            self.model = BertForSequenceClassification.from_pretrained(str(self.config.model_path))
            self.model.to(self.device)
            self.model.eval()
            
            logger.info("Model loaded successfully")
            
        except Exception as e:
            logger.error(f"Model initialization error: {str(e)}")
            raise

    def analyze_emotion(self, text: str) -> Optional[Dict]:
        """텍스트 감정 분석"""
        try:
            if not text or not isinstance(text, str):
                raise ValueError("Invalid input text")

            # 텍스트 전처리
            inputs = self.tokenizer(
                text,
                truncation=True,
                max_length=self.config.max_length,
                padding='max_length',
                return_tensors='pt'
            )
            
            inputs = {k: v.to(self.device) for k, v in inputs.items()}
            
            # 감정 분석 수행
            with torch.no_grad():
                outputs = self.model(**inputs)
                predictions = torch.softmax(outputs.logits, dim=1)
            
            # 결과 처리
            emotion_scores = predictions[0].cpu().numpy()
            predicted_idx = torch.argmax(predictions, dim=1).item()
            
            return {
                'emotion': self.config.emotion_labels[predicted_idx],
                'scores': {
                    label: float(score) 
                    for label, score in zip(self.config.emotion_labels, emotion_scores)
                }
            }
            
        except Exception as e:
            logger.error(f"Analysis error: {str(e)}")
            return None

    @classmethod
    def load_from_checkpoint(cls, checkpoint_path: str):
        """특정 체크포인트에서 모델 로드"""
        instance = cls()
        try:
            checkpoint = torch.load(checkpoint_path, map_location=instance.device)
            instance.model.load_state_dict(checkpoint['model_state_dict'])
            logger.info(f"Model loaded from checkpoint: {checkpoint_path}")
            return instance
        except Exception as e:
            logger.error(f"Error loading checkpoint: {str(e)}")
            raise