# prerequisites: 
# pip install git+https://github.com/openai/whisper.git
# install ffmpeg

import whisper

# Load the Whisper model
model = whisper.load_model("base")

# Transcribe an audio file
result = model.transcribe("audio_file.mp3")

# Print the transcription
print(result["text"])