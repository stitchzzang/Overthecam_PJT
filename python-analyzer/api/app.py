import sys
import re 
from pathlib import Path
sys.path.append(str(Path(__file__).parent.parent))

from flask import Flask, request, jsonify
import logging
from typing import List, Dict
import json
from pathlib import Path

from analyzer.debate_analyzer import DebateAnalyzer

# API 서버 설정
app = Flask(__name__)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# 전역 분석기 인스턴스
analyzer = None

def init_analyzer():
    """분석기 초기화"""
    global analyzer
    if analyzer is None:
        analyzer = DebateAnalyzer()
    return analyzer

def split_into_sentences(text: str) -> List[str]:
    """텍스트를 문장 단위로 분리"""
    # 좀 더 정교한 문장 분리 로직
    sentences = re.split(r'(?<=[.!?])\s+', text)
    # 빈 문장 제거 및 양쪽 공백 제거
    return [sentence.strip() for sentence in sentences if sentence.strip()]

def analyze_sentence_batch(analyzer: DebateAnalyzer, user_id: str, sentences: List[str]):
    results = []

    # 추가 로깅
    logger.info(f"Total sentences to analyze: {len(sentences)}")
    
    # 3문장씩 묶어서 분석 (마지막 남은 문장들도 포함)
    for i in range(0, len(sentences), 3):
        batch = sentences[i:i+3]

        # 추가 로깅
        logger.info(f"Current batch: {batch}")
        
        # 문장 수와 상관없이 분석 진행
        analysis_result = analyzer.process_debate_text(
            user_id,
            batch  # 개별 문장들을 분석
        )

                # 추가 로깅
        logger.info(f"Analysis result for batch: {analysis_result}")


        results.append({
            'sentences': batch,
            'analysis': analysis_result
        })
    
    return results

@app.route('/', methods=['GET'])
def index():
    return jsonify({
        'status': 'server is running',
        'message': 'Debate Analyzer Flask Server is Active'
    }), 200

@app.route('/api/debate/analyze', methods=['POST'])
def analyze_text():
    """Spring 백엔드에서 전송한 5분 단위 텍스트 분석 엔드포인트
    
    Expected JSON format:
    {
        "userId": 123,
        "text": "5분동안 수집된 전체 텍스트..."
    }
    """
    try:
        
        data = request.json
        if not data or 'userId' not in data or 'text' not in data:
            return jsonify({
                'success': False,
                'message': 'Invalid request format',
                'data': None
            }), 400
        
        # 2. 데이터 추출 후 로깅
        text = data['text']
        user_id = str(data['userId'])
        logger.info(f"Received request from userId: {user_id}")
        logger.info(f"Text length: {len(text)} characters")
        logger.info(f"Text preview: {text[:100]}...")  # 처음 100자만 로깅

        # 분석기 초기화 확인
        global analyzer
        if analyzer is None:
            analyzer = init_analyzer()

        # 텍스트를 문장 단위로 분리
        text = data['text']
        user_id = str(data['userId'])
        sentences = split_into_sentences(text)
        
        logger.info(f"Received text from user {user_id}. Total sentences: {len(sentences)}")
        
        # 3문장씩 분석 실행
        analysis_results = analyze_sentence_batch(analyzer, user_id, sentences)
        
        response_data = {
            'total_sentences': len(sentences),
            'batch_count': len(analysis_results),
            'analysis_results': analysis_results
        }
        
        return jsonify({
            'success': True,
            'message': 'Analysis completed',
            'data': response_data
        })

    except Exception as e:
        logger.error(f"Analysis error: {str(e)}")
        return jsonify({
            'success': False,
            'message': str(e),
            'data': None
        }), 500



# @app.route('/api/debate/health', methods=['GET'])
# def health_check():
#     """서버 상태 확인 엔드포인트"""
#     return jsonify({
#         'status': 'healthy',
#         'model_loaded': analyzer is not None
#     })


import logging
logging.basicConfig(level=logging.DEBUG)  # 더 상세한 로깅 활성화

def start_server(host='0.0.0.0', port=5001):
    init_analyzer()  # 서버 시작 시 분석기 초기화
    logging.info(f"Starting Flask server on {host}:{port}")
    print(f"Flask server starting on {host}:{port}")  # 콘솔 출력도 추가
    app.run(host=host, port=port, debug=True)  # debug 모드 활성화
    
if __name__ == '__main__':
    start_server()