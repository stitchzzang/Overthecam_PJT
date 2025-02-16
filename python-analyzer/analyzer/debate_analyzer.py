import os
import torch
import threading
from pathlib import Path
from typing import Dict, List, Optional
import logging
from transformers import BertTokenizer, BertForSequenceClassification
import datetime  # 상단에 import 추가


logger = logging.getLogger(__name__)

class DebateAnalyzer:
    """토론 텍스트 실시간 감정 분석기"""
    
    _instance = None
    _lock = threading.Lock()
    
    def __new__(cls):
        if cls._instance is None:
            with cls._lock:
                if cls._instance is None:
                    cls._instance = super(DebateAnalyzer, cls).__new__(cls)
        return cls._instance

    def __init__(self):
        if not hasattr(self, 'initialized'):
            self.device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
            self.emotion_labels = ['기쁨', '슬픔', '분노', '불안', '중립']
            self.buffer_size = 5  # 한 번에 분석할 문장 수
            self.initialize_model()
            self.initialized = True

    def initialize_model(self):
        """BERT 모델 초기화"""
        try:
            model_path = Path(__file__).parent.parent / 'models' / 'saved' / 'emotion_model'
            
            if not model_path.exists():
                raise ValueError(f"Model path not found: {model_path}")
                
            # 모델과 토크나이저 로드
            self.tokenizer = BertTokenizer.from_pretrained(str(model_path))
            self.model = BertForSequenceClassification.from_pretrained(str(model_path))
            self.model.to(self.device)
            self.model.eval()
            
        except Exception as e:
            logger.error(f"Model initialization error: {str(e)}")
            raise

    def analyze_debate_segment(self, texts: List[str]) -> List[Dict]:
        """여러 문장을 배치로 처리하여 감정 분석
        
        Args:
            texts: 분석할 문장 리스트 (3-5문장)
            
        Returns:
            감정 분석 결과 리스트
        """
        try:
            if not texts:
                return []
            
            # 배치 전처리
            encoded = self.tokenizer(
                texts,
                truncation=True,
                max_length=512,
                padding=True,
                return_tensors='pt'
            )
            
            inputs = {k: v.to(self.device) for k, v in encoded.items()}
            
            # 배치 추론
            with torch.no_grad():
                outputs = self.model(**inputs)
                predictions = torch.softmax(outputs.logits, dim=1)
            
            # 결과 처리
            results = []
            for idx, pred in enumerate(predictions):
                scores = pred.cpu().numpy()
                predicted_idx = torch.argmax(pred).item()
                
                results.append({
                    'text': texts[idx],
                    'emotion': self.emotion_labels[predicted_idx],
                    'scores': {
                        label: float(score)
                        for label, score in zip(self.emotion_labels, scores)
                    },
                    'sequence_num': idx  # 문장 순서 보존
                })
            
            return results
            
        except Exception as e:
            logger.error(f"Batch analysis error: {str(e)}")
            return []

    def process_debate_text(self, debate_id: str, text_chunks: List[str]) -> Dict:
        try:
            # 문장 수와 상관없이 모든 문장 분석
            results = self.analyze_debate_segment(text_chunks)
            
            return {
                'debate_id': debate_id,
                'analysis_results': results,
                'total_chunks': len(text_chunks),
                'timestamp': datetime.datetime.now().isoformat()
        }
            
        except Exception as e:
            logger.error(f"Text processing error for debate {debate_id}: {str(e)}")
            return {
                'debate_id': debate_id,
                'error': str(e),
                'status': 'failed'
            }