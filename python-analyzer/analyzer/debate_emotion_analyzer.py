# KLUE/BERT 기반 감정 분석 구현
# 기존 체크포인트 활용 기능
# 화자별 감정 이력 추적
# 저장된 체크포인트에서 최신 모델 로드
# 텍스트 감정 분석 수행
# 화자별 감정 이력 추적
# 감정 점수, 이모지, 신뢰도 제공
# 문맥 분석 (연속된 감정, 감정 변화)

import torch
from transformers import AutoModelForSequenceClassification, AutoTokenizer
from typing import Dict, List, Optional
import logging
from pathlib import Path
import numpy as np
from datetime import datetime
from collections import deque

logger = logging.getLogger(__name__)

class DebateEmotionAnalyzer:
    """토론 감정 분석기"""
    
    def __init__(self, config):
        self.config = config
        self.device = torch.device(config.device)
        self.emotion_histories = {}
        self.initialize_model()
        
    def initialize_model(self):
        """KLUE/BERT 모델 초기화"""
        try:
            latest_checkpoint = self._find_latest_checkpoint()
            
            if latest_checkpoint:
                logger.info(f"Loading model from checkpoint: {latest_checkpoint}")
                self.model = AutoModelForSequenceClassification.from_pretrained(
                    latest_checkpoint,
                    num_labels=self.config.num_labels
                )
                self.tokenizer = AutoTokenizer.from_pretrained(latest_checkpoint)
            else:
                logger.info("Loading new model from KLUE/BERT")
                self.model = AutoModelForSequenceClassification.from_pretrained(
                    self.config.model_name,
                    num_labels=self.config.num_labels
                )
                self.tokenizer = AutoTokenizer.from_pretrained(self.config.model_name)
            
            self.model.to(self.device)
            self.model.eval()
            
        except Exception as e:
            logger.error(f"Model initialization error: {str(e)}")
            raise
            
    def _find_latest_checkpoint(self) -> Optional[str]:
        """최신 체크포인트 찾기"""
        checkpoints = list(self.config.checkpoint_path.glob("checkpoint_epoch_*.pt"))
        if not checkpoints:
            return None
        return str(max(checkpoints, key=lambda x: int(x.stem.split("_")[-1])))
    
    def analyze_text(self, speaker_id: str, text: str) -> Dict:
        """텍스트 감정 분석"""
        try:
        # 1. 텍스트 전처리
            # - 최소 길이 검증
            # - 토큰화
            # 텍스트 검증
            if len(text) < self.config.min_text_length:
                return self._create_error_output(speaker_id, text, "Text too short")
                
            # 토크나이징
            encoded = self.tokenizer(
                text,
                truncation=True,
                max_length=self.config.max_length,
                padding=True,
                return_tensors='pt'
            )
            
            inputs = {k: v.to(self.device) for k, v in encoded.items()}
            
            # 2. 모델 추론
            # - GPU에서 감정 분석
            # - 소프트맥스로 확률 계산
            # 감정 분석
            with torch.no_grad():
                outputs = self.model(**inputs)
                predictions = torch.softmax(outputs.logits, dim=1)
            
            # 3. 결과 처리
            # - 주요 감정 선택
            # - 신뢰도 계산
            # 결과 처리
            scores = predictions[0].cpu().numpy()
            emotion_scores = self._process_emotion_scores(scores)
            
            # 4. 화자별 감정 이력 추적
            # - 연속된 감정 분석
            # - 감정 변화 패턴 추적
            # 감정 이력 업데이트
            self._update_emotion_history(speaker_id, emotion_scores['primary_emotion'])
            
            return {
                'speaker_id': speaker_id,
                'text': text,
                'emotion_analysis': emotion_scores,
                'context_analysis': self._analyze_context(speaker_id),
                'timestamp': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Analysis error: {str(e)}")
            return self._create_error_output(speaker_id, text, str(e))
            
    def _process_emotion_scores(self, scores: np.ndarray) -> Dict:
        """감정 점수 처리"""
        emotion_labels = list(self.config.emotion_labels.keys())
        max_score_idx = np.argmax(scores)
        primary_emotion = emotion_labels[max_score_idx]
        
        return {
            'primary_emotion': primary_emotion,
            'emotion_name': self.config.emotion_labels[primary_emotion]['name'],
            'confidence': float(scores[max_score_idx]),
            'scores': {
                label: {
                    'score': float(score),
                    'name': self.config.emotion_labels[label]['name'],
                }
                for label, score in zip(emotion_labels, scores)
            }
        }
        
    def _update_emotion_history(self, speaker_id: str, emotion: str):
        """감정 이력 업데이트"""
        if speaker_id not in self.emotion_histories:
            self.emotion_histories[speaker_id] = deque(maxlen=10)
        self.emotion_histories[speaker_id].append(emotion)
        
    def _analyze_context(self, speaker_id: str) -> Dict:
        """문맥 분석"""
        if speaker_id not in self.emotion_histories:
            return {}
            
        history = list(self.emotion_histories[speaker_id])
        
        # 연속된 감정 분석
        current_emotion = history[-1]
        consecutive_count = 1
        for emotion in reversed(history[:-1]):
            if emotion == current_emotion:
                consecutive_count += 1
            else:
                break
                
        # 감정 변화 패턴
        emotion_changes = []
        for i in range(1, len(history)):
            if history[i] != history[i-1]:
                emotion_changes.append({
                    'from': history[i-1],
                    'to': history[i],
                    'from_name': self.config.emotion_labels[history[i-1]]['name'],
                    'to_name': self.config.emotion_labels[history[i]]['name']
                })
        
        return {
            'consecutive_emotion': {
                'emotion': current_emotion,
                'name': self.config.emotion_labels[current_emotion]['name'],
                'count': consecutive_count
            },
            'emotion_changes': emotion_changes[-3:],  # 최근 3개 변화만
            'total_utterances': len(history)
        }
        
    @staticmethod
    def _create_error_output(speaker_id: str, text: str, error_msg: str) -> Dict:
        """에러 출력 생성"""
        return {
            'speaker_id': speaker_id,
            'text': text,
            'error': error_msg,
            'status': 'error',
            'timestamp': datetime.now().isoformat()
        }