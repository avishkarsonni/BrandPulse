"""
Example usage of the Enhanced Sentiment Analysis Model with Sarcasm Detection

This script demonstrates how to:
1. Train the multi-task model
2. Make predictions
3. Save and load the model
"""

from bilstm_with_embeddings import BiLSTMWithEmbeddings, main_multitask
import pickle

def train_new_model():
    """Train a new model from scratch"""
    print("Training new model with sarcasm detection...")
    bilstm, history, metrics = main_multitask()
    
    # Save tokenizer for future use
    with open('tokenizer.pkl', 'wb') as f:
        pickle.dump(bilstm.tokenizer, f)
    
    print("\nModel saved!")
    return bilstm

def load_and_predict(model_path='best_multitask_sarcasm_sentiment_model.h5', 
                     tokenizer_path='tokenizer.pkl'):
    """Load a trained model and make predictions"""
    from tensorflow.keras.models import load_model
    
    # Initialize model wrapper
    bilstm = BiLSTMWithEmbeddings(vocab_size=25000, max_length=120, embedding_dim=200)
    
    # Load tokenizer
    with open(tokenizer_path, 'rb') as f:
        bilstm.tokenizer = pickle.load(f)
    
    # Load model
    bilstm.model = load_model(model_path)
    
    print("Model loaded successfully!")
    return bilstm

def test_predictions(bilstm):
    """Test the model with various examples"""
    
    test_cases = [
        {
            'category': 'Genuine Positive',
            'texts': [
                "I absolutely love this product! Best purchase ever!",
                "This is amazing! Highly recommend to everyone!",
                "Fantastic quality and great customer service!"
            ]
        },
        {
            'category': 'Genuine Negative',
            'texts': [
                "Terrible product, complete waste of money",
                "Worst experience ever, would not recommend",
                "Poor quality and horrible customer support"
            ]
        },
        {
            'category': 'Sarcastic - Actually Negative',
            'texts': [
                "Oh great, another broken product. Just what I needed! #sarcasm",
                "Love how it stopped working after one day. Perfect! #irony",
                "Such amazing quality! It fell apart immediately. #sarcasm"
            ]
        },
        {
            'category': 'Sarcastic - Actually Positive (Ironic)',
            'texts': [
                "This is so terrible... I can't stop using it!",
                "Yeah, it's 'awful' - only my favorite product now #irony"
            ]
        },
        {
            'category': 'Neutral/Mixed',
            'texts': [
                "It's okay, nothing special",
                "Average product, does the job",
                "Not bad but could be improved"
            ]
        }
    ]
    
    for test_group in test_cases:
        print(f"\n{'='*80}")
        print(f"Category: {test_group['category']}")
        print('='*80)
        
        for text in test_group['texts']:
            result = bilstm.predict_sentiment(text)
            
            print(f"\nText: {text}")
            print(f"│")
            print(f"├─ Sarcasm Detected: {'YES ⚠️' if result['is_sarcastic'] else 'NO ✓'}")
            print(f"│  └─ Confidence: {result['sarcasm_confidence']:.3f}")
            print(f"│")
            print(f"└─ Final Sentiment: {result['sentiment']}")
            print(f"   └─ Confidence: {result['sentiment_confidence']:.3f}")
            print(f"   └─ Probabilities: Negative={result['sentiment_probabilities']['negative']:.3f}, "
                  f"Positive={result['sentiment_probabilities']['positive']:.3f}")
            
            # Show raw sentiment if different from final (due to sarcasm)
            if 'raw_sentiment' in result and result['is_sarcastic']:
                print(f"   └─ Raw (literal) sentiment: {result['raw_sentiment']['label']} "
                      f"(before sarcasm correction)")

def predict_custom_text(bilstm):
    """Interactive mode to predict custom text"""
    print("\n" + "="*80)
    print("INTERACTIVE PREDICTION MODE")
    print("="*80)
    print("Enter text to analyze (or 'quit' to exit)")
    
    while True:
        text = input("\n> ")
        
        if text.lower() in ['quit', 'exit', 'q']:
            print("Goodbye!")
            break
            
        if not text.strip():
            continue
            
        result = bilstm.predict_sentiment(text)
        
        print(f"\n{'─'*80}")
        print(f"📝 Text: {text}")
        print(f"{'─'*80}")
        
        # Sarcasm detection
        if result['is_sarcastic']:
            print(f"🎭 Sarcasm: YES (Confidence: {result['sarcasm_confidence']:.1%})")
            print(f"   └─ This text contains sarcasm or irony!")
        else:
            print(f"✓ Sarcasm: NO (Confidence: {result['sarcasm_confidence']:.1%})")
            print(f"   └─ This text is literal/straightforward")
        
        # Sentiment
        sentiment_emoji = "😊" if "Positive" in result['sentiment'] and not result['is_sarcastic'] else "😞"
        print(f"\n{sentiment_emoji} Final Sentiment: {result['sentiment']}")
        print(f"   └─ Confidence: {result['sentiment_confidence']:.1%}")
        print(f"   └─ Negative: {result['sentiment_probabilities']['negative']:.1%}")
        print(f"   └─ Positive: {result['sentiment_probabilities']['positive']:.1%}")
        
        # Show raw sentiment if sarcasm was detected
        if result['is_sarcastic'] and 'raw_sentiment' in result:
            print(f"\n📊 Raw (literal) Sentiment: {result['raw_sentiment']['label']}")
            print(f"   └─ This is what the words literally say, before sarcasm correction")
            print(f"   └─ Negative: {result['raw_sentiment']['probabilities']['negative']:.1%}")
            print(f"   └─ Positive: {result['raw_sentiment']['probabilities']['positive']:.1%}")
        
        # Interpretation
        print(f"\n💡 Interpretation:")
        if result['is_sarcastic'] and result['sarcasm_confidence'] > 0.55:
            print(f"   ⚠️  SARCASM DETECTED: Text is sarcastic/ironic")
            print(f"   The literal words may sound positive, but the actual sentiment is NEGATIVE")
            print(f"   Sarcasm typically expresses negativity through positive-sounding words.")
        elif result['sentiment_confidence'] > 0.8:
            print(f"   ✓ High confidence prediction - sentiment is clear and straightforward.")
        else:
            print(f"   ~ Moderate confidence - sentiment may be nuanced or mixed.")

def main():
    """Main function"""
    print("Enhanced Sentiment Analysis with Sarcasm Detection")
    print("="*80)
    print("\nOptions:")
    print("1. Train new model")
    print("2. Load existing model and test")
    print("3. Load existing model and interactive mode")
    
    choice = input("\nEnter choice (1-3): ")
    
    if choice == '1':
        bilstm = train_new_model()
        print("\nTesting predictions on trained model...")
        test_predictions(bilstm)
        
    elif choice == '2':
        try:
            bilstm = load_and_predict()
            test_predictions(bilstm)
        except FileNotFoundError:
            print("Error: Model file not found. Please train a model first.")
            
    elif choice == '3':
        try:
            bilstm = load_and_predict()
            predict_custom_text(bilstm)
        except FileNotFoundError:
            print("Error: Model file not found. Please train a model first.")
            
    else:
        print("Invalid choice!")

if __name__ == "__main__":
    main()

