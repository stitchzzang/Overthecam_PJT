# api/app.py
# Flask API 서버

# api/app.py
from flask import Flask, request, jsonify
import logging
from pathlib import Path
import sys

sys.path.append(str(Path(__file__).parent.parent))

from analyzer.debate_emotion_config import DebateAnalyzer

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

analyzer = None

def init_analyzer():
    """분석기 초기화"""
    global analyzer
    if analyzer is None:
        analyzer = DebateAnalyzer()
    return analyzer


@app.route('/python')  # 두 경로 모두 처리
def index():
    return jsonify({
        'message': 'Python Emotion Analysis Server',
        'status': 'running',
        'endpoints': {
            'health_check': '/api/health',
            'analyze': '/api/debate/analyze'
        }
    })

@app.route('/api/debate/analyze', methods=['POST'])
def analyze_debate():
    """
    텍스트를 받아서 문장 단위로 분리한 후 감정 분석
    text에 여러 문장이 포함될 수 있음 (마침표, 느낌표, 물음표로 구분)
    """
    try:
        data = request.json
        if not data or 'speakerId' not in data or 'text' not in data:
            return jsonify({
                'success': False,
                'message': 'Invalid request format'
            }), 400
            
        text = data['text']
        speaker_id = str(data['speakerId'])
        
        # 문장 단위로 분리 (마침표, 느낌표, 물음표 기준)
        sentences = []
        current = ""
        
        for char in text:
            current += char
            if char in ['!', '?', '.']:
                sentences.append(current.strip())
                current = ""
        
        if current.strip():  # 마지막 문장 처리
            sentences.append(current.strip())
            
        # 빈 문장 제거
        text_chunks = [s for s in sentences if s]
        
        if not text_chunks:
            return jsonify({
                'success': False,
                'message': 'No valid sentences found'
            }), 400
        
        global analyzer
        if analyzer is None:
            analyzer = init_analyzer()
            
        analysis_result = analyzer.process_debate_text(
            debate_id=speaker_id,
            text_chunks=text_chunks
        )
        
        return jsonify({
            'success': True,
            'data': analysis_result
        })
        
    except Exception as e:
        logger.error(f"Analysis error: {str(e)}")
        return jsonify({
            'success': False,
            'message': str(e)
        }), 500

@app.route('/api/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'healthy',
        'model_loaded': analyzer is not None
    })

def start_server(host='0.0.0.0', port=5001):
    init_analyzer()
    logger.info(f"Starting Flask server on {host}:{port}")
    app.run(host=host, port=port, debug=True)

if __name__ == '__main__':
    start_server()