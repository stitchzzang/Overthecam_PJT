# 설정 파일

import torch
from dataclasses import dataclass, field
from pathlib import Path

@dataclass
class BaseConfig:
    # 기본 모델 설정
    model_name: str = "klue/bert-base"
    num_labels: int = 5
    max_length: int = 512
    device: str = "cuda" if torch.cuda.is_available() else "cpu"
    
    # 경로 설정
    base_path: Path = Path("models")
    model_path: Path = field(default_factory=lambda: Path("models/saved/emotion_model"))
    checkpoint_path: Path = field(default_factory=lambda: Path("models/checkpoints"))
    
    # 감정 레이블
    emotion_labels: list = field(default_factory=lambda: ['화남', '기쁨', '중립', '슬픔', '놀람'])

@dataclass
class TrainingConfig(BaseConfig):
    # 학습 관련 설정
    epochs: int = 5
    batch_size: int = 16
    learning_rate: float = 2e-5
    weight_decay: float = 0.01
    warmup_steps: int = 0
    max_grad_norm: float = 1.0
    
    # 데이터 경로
    train_data_path: str = "data/labeled/train.json"
    eval_data_path: str = "data/labeled/eval.json"

@dataclass
class PreprocessConfig:
    input_file: str = "data/raw/emotional_dialogue_dataset.json"
    output_dir: str = "data/labeled"
    train_ratio: float = 0.8
    max_samples: int = 50000

@dataclass
class APIConfig:
    host: str = "0.0.0.0"
    port: int = 5000
    debug: bool = False