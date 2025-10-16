# Enhanced Sentiment Analysis Model with Sarcasm & Irony Detection

## Overview

This is an advanced **Multi-Task BiLSTM model** that performs:
1. **Sarcasm/Irony Detection** - Identifies figurative language in text
2. **Sentiment Analysis** - Classifies sentiment as positive or negative with sarcasm awareness

The model uses a shared BiLSTM architecture with specialized branches for each task, allowing it to learn both tasks simultaneously and leverage the relationship between sarcasm detection and sentiment analysis.

### ⚠️ Important: Sarcasm = Negative

**All sarcastic and ironic content is classified as NEGATIVE sentiment.**

This is because sarcasm and irony are linguistic devices primarily used to express negative sentiment through positive-sounding words. For example:
- "Oh great, another problem! #sarcasm" → Detected as **NEGATIVE** (not positive)
- "Love how it broke after one day!" → Detected as **NEGATIVE** (sarcastic complaint)

The model provides both:
- **Raw sentiment**: What the literal words say
- **Final sentiment**: Corrected for sarcasm (sarcastic = negative)

See `SARCASM_AS_NEGATIVE.md` for detailed explanation.

## Features

### 🎯 Multi-Task Learning Architecture
- **Shared Feature Extraction**: BiLSTM layers capture contextual information
- **Multi-Head Attention**: Enhances understanding of complex linguistic patterns
- **Task-Specific Branches**: 
  - Sarcasm detection branch identifies figurative language
  - Sentiment analysis branch uses sarcasm information for better predictions

### 🔍 Sarcasm-Aware Sentiment Analysis
- Detects when text contains sarcasm or irony
- **Automatically classifies sarcastic/ironic content as NEGATIVE sentiment**
- Provides both raw (literal) and final (corrected) sentiment
- Confidence scores for both detection and classification tasks

### 📊 Pre-trained Embeddings
- Uses GloVe 200-dimensional word embeddings
- Better semantic understanding of words
- Improved performance on out-of-vocabulary words

### 🧹 Advanced Text Preprocessing
- Handles contractions, repeated characters, URLs
- Preserves important linguistic markers
- Removes noise while maintaining context

## Model Architecture

```
Input Text
    ↓
[Embedding Layer - GloVe 200d]
    ↓
[Shared BiLSTM Layers (128 → 64 → 32 units)]
    ↓
[Multi-Head Attention]
    ↓
    ├─────────────────────────┬─────────────────────────┐
    ↓                         ↓                         ↓
[Sarcasm Branch]      [Shared Features]    [Sentiment Branch]
    ↓                         ↓                         ↓
Dense(64→32)                  └──────→ Concatenate ←───┘
    ↓                                      ↓
Sarcasm Output                      Dense(128→64→32)
(Literal/Figurative)                     ↓
                                   Sentiment Output
                                  (Negative/Positive)
```

## Datasets

### 1. Sentiment Analysis Data
- **File**: `train.csv`, `test.csv`
- **Format**: `id, label, tweet`
- **Labels**: 0 (Negative), 1 (Positive)
- **Size**: ~32K training samples

### 2. Sarcasm/Irony Detection Data
- **File**: `archive/train.csv`, `archive/test.csv`
- **Format**: `tweets, class`
- **Labels**: "figurative" (sarcasm/irony), "literal" (normal)
- **Size**: ~97K training samples

## Installation

### Requirements
```bash
pip install pandas numpy tensorflow scikit-learn matplotlib seaborn requests
```

### Dependencies
- Python 3.8+
- TensorFlow 2.x
- NumPy
- Pandas
- Scikit-learn
- Matplotlib & Seaborn (for visualization)

## Usage

### Training the Model

```python
from bilstm_with_embeddings import BiLSTMWithEmbeddings, main_multitask

# Train the model
bilstm, history, metrics = main_multitask()
```

### Making Predictions

```python
# Initialize and load your trained model
bilstm = BiLSTMWithEmbeddings()
# ... load model weights ...

# Predict sentiment with sarcasm detection
result = bilstm.predict_sentiment("Oh great, another wonderful day! #sarcasm")

print(result)
# Output:
# {
#     'text': 'Oh great, another wonderful day! #sarcasm',
#     'clean_text': 'oh great another wonderful day sarcasm',
#     'is_sarcastic': True,
#     'sarcasm_confidence': 0.892,
#     'sarcasm_probabilities': {
#         'literal': 0.108,
#         'figurative': 0.892
#     },
#     'sentiment': 'Negative (sarcasm/irony detected - interpreted as negative)',
#     'sentiment_value': 0,  # 0 = Negative, 1 = Positive
#     'sentiment_confidence': 0.756,
#     'sentiment_probabilities': {
#         'negative': 0.847,  # High negative probability
#         'positive': 0.153
#     },
#     'raw_sentiment': {  # What the literal words say
#         'label': 'Positive',
#         'confidence': 0.721,
#         'probabilities': {
#             'negative': 0.279,
#             'positive': 0.721
#         }
#     }
# }
```

## Model Performance

### Expected Metrics

**Sarcasm Detection:**
- Accuracy: ~75-85%
- F1-Score: ~0.75-0.85
- Precision/Recall: Balanced performance

**Sentiment Analysis:**
- Accuracy: ~80-90%
- F1-Score: ~0.80-0.90
- Improved accuracy on sarcastic content

### Confusion Matrices

The model generates confusion matrices for both tasks:
- Sarcasm Detection: Literal vs Figurative
- Sentiment Analysis: Negative vs Positive

## Training Process

1. **Load GloVe Embeddings**: Downloads and loads pre-trained word vectors
2. **Load Datasets**: Loads both sentiment and sarcasm datasets
3. **Combine Data**: Merges datasets with appropriate labels
4. **Tokenization**: Creates vocabulary and converts text to sequences
5. **Build Model**: Constructs multi-task architecture
6. **Train**: Trains with early stopping and learning rate reduction
7. **Evaluate**: Generates metrics and visualizations

## Model Checkpoints

The best model is saved as:
- `best_multitask_sarcasm_sentiment_model.h5`

## Hyperparameters

```python
vocab_size = 25000       # Vocabulary size
max_length = 120         # Maximum sequence length
embedding_dim = 200      # GloVe embedding dimension
batch_size = 32          # Training batch size
epochs = 30              # Maximum epochs (with early stopping)
learning_rate = 0.001    # Initial learning rate
```

## Architecture Details

### Loss Weights
- Sarcasm Detection: 0.4 (40%)
- Sentiment Analysis: 0.6 (60%)

### Dropout Rates
- BiLSTM layers: 0.2-0.3
- Dense layers: 0.2-0.5

### Callbacks
- **Early Stopping**: Patience of 10 epochs
- **Learning Rate Reduction**: Factor of 0.5, patience of 5 epochs
- **Model Checkpoint**: Saves best model based on validation accuracy

## Examples

### Literal Positive
```python
"I love this product! It's absolutely amazing!"
→ Sarcasm: NO, Sentiment: Positive
```

### Literal Negative
```python
"This is terrible, worst purchase ever"
→ Sarcasm: NO, Sentiment: Negative
```

### Sarcastic/Ironic
```python
"Love how my phone died right before my presentation. Perfect timing!"
→ Sarcasm: YES, Sentiment: NEGATIVE (sarcasm automatically classified as negative)
→ Raw sentiment: Positive (literal words)
```

```python
"Such a great product! It broke after one day. Amazing quality! #sarcasm"
→ Sarcasm: YES, Sentiment: NEGATIVE (sarcasm = negative)
→ Raw sentiment: Positive (before sarcasm correction)
```

## Key Improvements Over Basic Models

1. **Sarcasm Awareness**: Detects when sentiment is inverted due to sarcasm
2. **Multi-Task Learning**: Learns both tasks simultaneously for better feature extraction
3. **Attention Mechanism**: Multi-head attention captures complex patterns
4. **Pre-trained Embeddings**: GloVe embeddings provide better semantic understanding
5. **Larger Dataset**: Combines multiple datasets for more robust training

## Future Enhancements

- [ ] Add neutral sentiment class
- [ ] Implement BERT-based embeddings for better context understanding
- [ ] Add emotion detection (anger, joy, sadness, etc.)
- [ ] Fine-tune on domain-specific data (e.g., product reviews, tweets)
- [ ] Add support for multiple languages
- [ ] Implement real-time inference API
- [ ] Add explainability features (attention visualization)

## File Structure

```
model/
├── bilstm_with_embeddings.py    # Main model code
├── train.csv                      # Sentiment training data
├── test.csv                       # Sentiment test data
├── archive/
│   ├── train.csv                 # Sarcasm training data
│   └── test.csv                  # Sarcasm test data
├── README.md                      # This file
└── best_multitask_sarcasm_sentiment_model.h5  # Saved model
```

## Citation

If you use this model in your research, please cite:

```
@software{sarcasm_aware_sentiment_analysis,
  title={Multi-Task BiLSTM for Sarcasm-Aware Sentiment Analysis},
  author={BrandPulse Team},
  year={2025},
  description={A multi-task learning model for sentiment analysis with sarcasm detection}
}
```

## License

See LICENSE file in the repository root.

## Contributing

Contributions are welcome! Please:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## Contact

For questions or issues, please open an issue in the repository.

---

**Note**: This model is designed for research and development purposes. For production use, consider additional testing, validation, and fine-tuning on your specific domain data.

