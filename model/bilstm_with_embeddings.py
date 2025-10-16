import pandas as pd
import numpy as np
import re
import matplotlib.pyplot as plt
import seaborn as sns
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score, classification_report, confusion_matrix
from sklearn.utils.class_weight import compute_class_weight
from tensorflow.keras.preprocessing.text import Tokenizer
from tensorflow.keras.preprocessing.sequence import pad_sequences
from tensorflow.keras.models import Sequential, Model
from tensorflow.keras.layers import (Embedding, Bidirectional, LSTM, Dense, Dropout, 
                                     BatchNormalization, GlobalMaxPooling1D, Input, 
                                     Concatenate, Attention, MultiHeadAttention, LayerNormalization)
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.callbacks import EarlyStopping, ReduceLROnPlateau, ModelCheckpoint
from tensorflow.keras.utils import to_categorical
import requests
import zipfile
import os
import warnings
warnings.filterwarnings('ignore')

class BiLSTMWithEmbeddings:
    def __init__(self, vocab_size=20000, max_length=100, embedding_dim=200):
        self.vocab_size = vocab_size
        self.max_length = max_length
        self.embedding_dim = embedding_dim
        self.tokenizer = None
        self.model = None
        self.class_weights = None
        self.embedding_matrix = None
        
    def download_glove_embeddings(self, embedding_dim=200):
        """Download GloVe embeddings if not present"""
        glove_file = f'glove.6B.{embedding_dim}d.txt'
        
        if not os.path.exists(glove_file):
            print(f"Downloading GloVe embeddings ({embedding_dim}d)...")
            url = f'http://nlp.stanford.edu/data/glove.6B.zip'
            
            # Download the zip file
            response = requests.get(url, stream=True)
            with open('glove.6B.zip', 'wb') as f:
                for chunk in response.iter_content(chunk_size=8192):
                    f.write(chunk)
            
            # Extract the specific embedding file
            with zipfile.ZipFile('glove.6B.zip', 'r') as zip_ref:
                zip_ref.extract(glove_file)
            
            # Clean up
            os.remove('glove.6B.zip')
            print("GloVe embeddings downloaded successfully!")
        else:
            print("GloVe embeddings already present!")
        
        return glove_file
    
    def load_glove_embeddings(self, glove_file):
        """Load GloVe embeddings into a dictionary"""
        print("Loading GloVe embeddings...")
        embeddings_index = {}
        
        with open(glove_file, 'r', encoding='utf-8') as f:
            for line in f:
                values = line.split()
                word = values[0]
                coefs = np.asarray(values[1:], dtype='float32')
                embeddings_index[word] = coefs
        
        print(f"Loaded {len(embeddings_index)} word vectors.")
        return embeddings_index
    
    def create_embedding_matrix(self, word_index, embeddings_index):
        """Create embedding matrix for the vocabulary"""
        print("Creating embedding matrix...")
        
        embedding_matrix = np.zeros((self.vocab_size, self.embedding_dim))
        found_words = 0
        
        for word, i in word_index.items():
            if i < self.vocab_size:
                embedding_vector = embeddings_index.get(word)
                if embedding_vector is not None:
                    embedding_matrix[i] = embedding_vector
                    found_words += 1
        
        print(f"Found embeddings for {found_words} words out of {self.vocab_size}")
        return embedding_matrix
    
    def advanced_clean_tweet(self, tweet):
        """Enhanced text preprocessing for better word sense understanding"""
        # Convert to lowercase
        tweet = tweet.lower()
        
        # Remove URLs
        tweet = re.sub(r'http\S+|www\S+|https\S+', '', tweet, flags=re.MULTILINE)
        
        # Remove user mentions but keep the structure
        tweet = re.sub(r'@\w+', '<USER>', tweet)
        
        # Remove hashtags but keep the word
        tweet = re.sub(r'#(\w+)', r'\1', tweet)
        
        # Handle repeated characters (e.g., "soooooo" -> "sooo")
        tweet = re.sub(r'(.)\1{2,}', r'\1\1', tweet)
        
        # Handle contractions
        contractions = {
            "don't": "do not", "won't": "will not", "can't": "cannot",
            "n't": " not", "'re": " are", "'s": " is", "'d": " would",
            "'ll": " will", "'t": " not", "'ve": " have", "'m": " am",
            "i'm": "i am", "you're": "you are", "he's": "he is",
            "she's": "she is", "it's": "it is", "we're": "we are",
            "they're": "they are", "isn't": "is not", "aren't": "are not",
            "wasn't": "was not", "weren't": "were not", "hasn't": "has not",
            "haven't": "have not", "hadn't": "had not", "doesn't": "does not",
            "didn't": "did not", "wouldn't": "would not", "couldn't": "could not",
            "shouldn't": "should not", "mustn't": "must not"
        }
        for contraction, expansion in contractions.items():
            tweet = tweet.replace(contraction, expansion)
        
        # Remove special characters but keep spaces and basic punctuation
        tweet = re.sub(r'[^\w\s<>!?.,]', ' ', tweet)
        
        # Remove extra whitespaces
        tweet = re.sub(r'\s+', ' ', tweet)
        
        # Remove standalone numbers but keep numbers in context
        tweet = re.sub(r'\b\d+\b', '', tweet)
        
        return tweet.strip()
    
    def load_and_preprocess_data(self, train_path, test_path):
        """Load and preprocess the dataset"""
        print("Loading datasets...")
        train_df = pd.read_csv(train_path)
        test_df = pd.read_csv(test_path)
        
        print(f"Original train shape: {train_df.shape}")
        print(f"Original test shape: {test_df.shape}")
        
        # Remove duplicates and null values
        train_df = train_df.drop_duplicates().dropna(subset=['tweet', 'label'])
        test_df = test_df.drop_duplicates().dropna(subset=['tweet'])
        
        print(f"After cleaning train shape: {train_df.shape}")
        print(f"After cleaning test shape: {test_df.shape}")
        
        # Apply advanced cleaning
        train_df['clean_tweet'] = train_df['tweet'].apply(self.advanced_clean_tweet)
        test_df['clean_tweet'] = test_df['tweet'].apply(self.advanced_clean_tweet)
        
        # Remove empty tweets after cleaning
        train_df = train_df[train_df['clean_tweet'].str.len() > 0]
        test_df = test_df[test_df['clean_tweet'].str.len() > 0]
        
        print(f"Final train shape: {train_df.shape}")
        print(f"Final test shape: {test_df.shape}")
        
        return train_df, test_df
    
    def prepare_tokenizer_and_sequences(self, train_df, test_df):
        """Prepare tokenizer and convert text to sequences"""
        print("Preparing tokenizer...")
        
        # Initialize tokenizer with larger vocabulary
        self.tokenizer = Tokenizer(
            num_words=self.vocab_size,
            oov_token="<OOV>",
            filters='!"#$%&()*+,-./:;<=>?@[\\]^_`{|}~\t\n'
        )
        
        # Fit on training data
        self.tokenizer.fit_on_texts(train_df['clean_tweet'])
        
        # Convert to sequences
        train_sequences = self.tokenizer.texts_to_sequences(train_df['clean_tweet'])
        test_sequences = self.tokenizer.texts_to_sequences(test_df['clean_tweet'])
        
        # Pad sequences
        X_train = pad_sequences(train_sequences, maxlen=self.max_length, padding='post', truncating='post')
        X_test = pad_sequences(test_sequences, maxlen=self.max_length, padding='post', truncating='post')
        
        y_train = train_df['label'].values
        
        print(f"Vocabulary size: {len(self.tokenizer.word_index)}")
        print(f"Training sequences shape: {X_train.shape}")
        print(f"Test sequences shape: {X_test.shape}")
        
        return X_train, X_test, y_train
    
    def compute_class_weights(self, y_train):
        """Compute class weights to handle imbalance"""
        class_weights = compute_class_weight(
            'balanced',
            classes=np.unique(y_train),
            y=y_train
        )
        self.class_weights = dict(zip(np.unique(y_train), class_weights))
        print(f"Class weights: {self.class_weights}")
        return self.class_weights
    
    def build_model_with_embeddings(self, num_classes=2):
        """Build BiLSTM model with pre-trained embeddings"""
        print("Building BiLSTM model with pre-trained embeddings...")
        
        model = Sequential([
            # Embedding layer with pre-trained weights
            Embedding(
                input_dim=self.vocab_size,
                output_dim=self.embedding_dim,
                input_length=self.max_length,
                weights=[self.embedding_matrix],
                trainable=False,  # Freeze embeddings initially
                mask_zero=True
            ),
            
            # First BiLSTM layer
            Bidirectional(
                LSTM(128, return_sequences=True, dropout=0.3, recurrent_dropout=0.3),
                name='bidirectional_lstm_1'
            ),
            BatchNormalization(),
            
            # Second BiLSTM layer
            Bidirectional(
                LSTM(64, return_sequences=True, dropout=0.3, recurrent_dropout=0.3),
                name='bidirectional_lstm_2'
            ),
            BatchNormalization(),
            
            # Third BiLSTM layer for better context understanding
            Bidirectional(
                LSTM(32, return_sequences=False, dropout=0.2, recurrent_dropout=0.2),
                name='bidirectional_lstm_3'
            ),
            BatchNormalization(),
            
            # Dense layers with dropout
            Dense(128, activation='relu'),
            BatchNormalization(),
            Dropout(0.5),
            
            Dense(64, activation='relu'),
            BatchNormalization(),
            Dropout(0.3),
            
            Dense(32, activation='relu'),
            BatchNormalization(),
            Dropout(0.2),
            
            # Output layer
            Dense(num_classes, activation='softmax')
        ])
        
        # Compile with improved optimizer
        model.compile(
            optimizer=Adam(learning_rate=0.001),
            loss='sparse_categorical_crossentropy',
            metrics=['accuracy']
        )
        
        self.model = model
        return model
    
    def train_model(self, X_train, y_train, X_val, y_val, epochs=25):
        """Train the model with callbacks"""
        print("Training model...")
        
        # Define callbacks
        callbacks = [
            EarlyStopping(
                monitor='val_loss',
                patience=7,
                restore_best_weights=True,
                verbose=1
            ),
            ReduceLROnPlateau(
                monitor='val_loss',
                factor=0.5,
                patience=4,
                min_lr=1e-7,
                verbose=1
            ),
            ModelCheckpoint(
                'best_bilstm_embeddings_model.h5',
                monitor='val_accuracy',
                save_best_only=True,
                verbose=1
            )
        ]
        
        # Train the model
        history = self.model.fit(
            X_train, y_train,
            validation_data=(X_val, y_val),
            epochs=epochs,
            batch_size=32,
            class_weight=self.class_weights,
            callbacks=callbacks,
            verbose=1
        )
        
        return history
    
    def evaluate_model(self, X_val, y_val):
        """Evaluate model performance"""
        print("Evaluating model...")
        
        # Predictions
        y_pred_prob = self.model.predict(X_val)
        y_pred = np.argmax(y_pred_prob, axis=1)
        
        # Calculate metrics
        accuracy = accuracy_score(y_val, y_pred)
        precision = precision_score(y_val, y_pred, average='weighted')
        recall = recall_score(y_val, y_pred, average='weighted')
        f1 = f1_score(y_val, y_pred, average='weighted')
        
        print(f"\n=== MODEL PERFORMANCE ===")
        print(f"Accuracy: {accuracy:.4f}")
        print(f"Precision: {precision:.4f}")
        print(f"Recall: {recall:.4f}")
        print(f"F1-Score: {f1:.4f}")
        
        # Classification report
        print(f"\n=== CLASSIFICATION REPORT ===")
        print(classification_report(y_val, y_pred, target_names=['Negative', 'Positive']))
        
        # Confusion matrix
        cm = confusion_matrix(y_val, y_pred)
        plt.figure(figsize=(8, 6))
        sns.heatmap(cm, annot=True, fmt='d', cmap='Blues', 
                   xticklabels=['Negative', 'Positive'],
                   yticklabels=['Negative', 'Positive'])
        plt.title('Confusion Matrix - BiLSTM with Pre-trained Embeddings')
        plt.ylabel('True Label')
        plt.xlabel('Predicted Label')
        plt.show()
        
        return accuracy, precision, recall, f1
    
    def plot_training_history(self, history):
        """Plot training history"""
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(15, 5))
        
        # Plot accuracy
        ax1.plot(history.history['accuracy'], label='Training Accuracy')
        ax1.plot(history.history['val_accuracy'], label='Validation Accuracy')
        ax1.set_title('Model Accuracy')
        ax1.set_xlabel('Epoch')
        ax1.set_ylabel('Accuracy')
        ax1.legend()
        ax1.grid(True)
        
        # Plot loss
        ax2.plot(history.history['loss'], label='Training Loss')
        ax2.plot(history.history['val_loss'], label='Validation Loss')
        ax2.set_title('Model Loss')
        ax2.set_xlabel('Epoch')
        ax2.set_ylabel('Loss')
        ax2.grid(True)
        
        plt.tight_layout()
        plt.show()
    
    def load_sarcasm_data(self, train_path, test_path):
        """Load and preprocess sarcasm/irony dataset from archive folder"""
        print("Loading sarcasm/irony datasets...")
        sarcasm_train = pd.read_csv(train_path)
        sarcasm_test = pd.read_csv(test_path)
        
        print(f"Original sarcasm train shape: {sarcasm_train.shape}")
        print(f"Original sarcasm test shape: {sarcasm_test.shape}")
        
        # Rename columns for consistency
        sarcasm_train.columns = ['tweet', 'class']
        sarcasm_test.columns = ['tweet', 'class']
        
        # Remove duplicates and null values
        sarcasm_train = sarcasm_train.drop_duplicates().dropna()
        sarcasm_test = sarcasm_test.drop_duplicates().dropna()
        
        # Binary label: 1 for figurative (sarcasm/irony), 0 for literal
        sarcasm_train['sarcasm_label'] = (sarcasm_train['class'] == 'figurative').astype(int)
        sarcasm_test['sarcasm_label'] = (sarcasm_test['class'] == 'figurative').astype(int)
        
        # Apply advanced cleaning
        sarcasm_train['clean_tweet'] = sarcasm_train['tweet'].apply(self.advanced_clean_tweet)
        sarcasm_test['clean_tweet'] = sarcasm_test['tweet'].apply(self.advanced_clean_tweet)
        
        # Remove empty tweets after cleaning
        sarcasm_train = sarcasm_train[sarcasm_train['clean_tweet'].str.len() > 0]
        sarcasm_test = sarcasm_test[sarcasm_test['clean_tweet'].str.len() > 0]
        
        print(f"Final sarcasm train shape: {sarcasm_train.shape}")
        print(f"Final sarcasm test shape: {sarcasm_test.shape}")
        print(f"Sarcasm distribution in train: {sarcasm_train['sarcasm_label'].value_counts()}")
        
        return sarcasm_train, sarcasm_test
    
    def build_multitask_model(self, num_sentiment_classes=2, num_sarcasm_classes=2):
        """Build multi-task BiLSTM model for both sentiment and sarcasm detection"""
        print("Building Multi-Task BiLSTM model with sarcasm detection...")
        
        # Input layer
        input_layer = Input(shape=(self.max_length,), name='input')
        
        # Embedding layer with pre-trained weights
        embedding = Embedding(
            input_dim=self.vocab_size,
            output_dim=self.embedding_dim,
            input_length=self.max_length,
            weights=[self.embedding_matrix] if self.embedding_matrix is not None else None,
            trainable=False,
            mask_zero=True,
            name='embedding'
        )(input_layer)
        
        # Shared BiLSTM layers for feature extraction
        bilstm1 = Bidirectional(
            LSTM(128, return_sequences=True, dropout=0.3, recurrent_dropout=0.3),
            name='shared_bilstm_1'
        )(embedding)
        bn1 = BatchNormalization()(bilstm1)
        
        bilstm2 = Bidirectional(
            LSTM(64, return_sequences=True, dropout=0.3, recurrent_dropout=0.3),
            name='shared_bilstm_2'
        )(bn1)
        bn2 = BatchNormalization()(bilstm2)
        
        # Multi-head attention for better context understanding
        attention = MultiHeadAttention(num_heads=4, key_dim=32, name='multihead_attention')(bn2, bn2)
        attention_norm = LayerNormalization()(attention)
        
        bilstm3 = Bidirectional(
            LSTM(32, return_sequences=False, dropout=0.2, recurrent_dropout=0.2),
            name='shared_bilstm_3'
        )(attention_norm)
        shared_features = BatchNormalization(name='shared_features')(bilstm3)
        
        # Sarcasm Detection Branch
        sarcasm_dense1 = Dense(64, activation='relu', name='sarcasm_dense_1')(shared_features)
        sarcasm_bn1 = BatchNormalization()(sarcasm_dense1)
        sarcasm_dropout1 = Dropout(0.4)(sarcasm_bn1)
        
        sarcasm_dense2 = Dense(32, activation='relu', name='sarcasm_dense_2')(sarcasm_dropout1)
        sarcasm_bn2 = BatchNormalization()(sarcasm_dense2)
        sarcasm_dropout2 = Dropout(0.3)(sarcasm_bn2)
        
        sarcasm_output = Dense(num_sarcasm_classes, activation='softmax', name='sarcasm_output')(sarcasm_dropout2)
        
        # Sentiment Analysis Branch (with sarcasm awareness)
        # Concatenate shared features with sarcasm detection output
        sentiment_input = Concatenate(name='sentiment_with_sarcasm')([shared_features, sarcasm_output])
        
        sentiment_dense1 = Dense(128, activation='relu', name='sentiment_dense_1')(sentiment_input)
        sentiment_bn1 = BatchNormalization()(sentiment_dense1)
        sentiment_dropout1 = Dropout(0.5)(sentiment_bn1)
        
        sentiment_dense2 = Dense(64, activation='relu', name='sentiment_dense_2')(sentiment_dropout1)
        sentiment_bn2 = BatchNormalization()(sentiment_dense2)
        sentiment_dropout2 = Dropout(0.3)(sentiment_bn2)
        
        sentiment_dense3 = Dense(32, activation='relu', name='sentiment_dense_3')(sentiment_dropout2)
        sentiment_bn3 = BatchNormalization()(sentiment_dense3)
        sentiment_dropout3 = Dropout(0.2)(sentiment_bn3)
        
        sentiment_output = Dense(num_sentiment_classes, activation='softmax', name='sentiment_output')(sentiment_dropout3)
        
        # Create multi-task model
        model = Model(inputs=input_layer, outputs=[sarcasm_output, sentiment_output], name='multitask_bilstm')
        
        # Compile with multiple losses
        model.compile(
            optimizer=Adam(learning_rate=0.001),
            loss={
                'sarcasm_output': 'sparse_categorical_crossentropy',
                'sentiment_output': 'sparse_categorical_crossentropy'
            },
            loss_weights={
                'sarcasm_output': 0.4,  # Weight for sarcasm detection
                'sentiment_output': 0.6  # Weight for sentiment analysis
            },
            metrics={
                'sarcasm_output': ['accuracy'],
                'sentiment_output': ['accuracy']
            }
        )
        
        self.model = model
        return model
    
    def train_multitask_model(self, X_train, y_train_sarcasm, y_train_sentiment, 
                              X_val, y_val_sarcasm, y_val_sentiment, epochs=30):
        """Train the multi-task model"""
        print("Training multi-task model...")
        
        # Define callbacks
        callbacks = [
            EarlyStopping(
                monitor='val_sentiment_output_accuracy',
                patience=10,
                restore_best_weights=True,
                verbose=1
            ),
            ReduceLROnPlateau(
                monitor='val_loss',
                factor=0.5,
                patience=5,
                min_lr=1e-7,
                verbose=1
            ),
            ModelCheckpoint(
                'best_multitask_sarcasm_sentiment_model.h5',
                monitor='val_sentiment_output_accuracy',
                save_best_only=True,
                verbose=1
            )
        ]
        
        # Train the model
        history = self.model.fit(
            X_train,
            {
                'sarcasm_output': y_train_sarcasm,
                'sentiment_output': y_train_sentiment
            },
            validation_data=(
                X_val,
                {
                    'sarcasm_output': y_val_sarcasm,
                    'sentiment_output': y_val_sentiment
                }
            ),
            epochs=epochs,
            batch_size=32,
            callbacks=callbacks,
            verbose=1
        )
        
        return history
    
    def evaluate_multitask_model(self, X_val, y_val_sarcasm, y_val_sentiment):
        """Evaluate multi-task model performance"""
        print("Evaluating multi-task model...")
        
        # Predictions
        predictions = self.model.predict(X_val)
        y_pred_sarcasm_prob = predictions[0]
        y_pred_sentiment_prob = predictions[1]
        
        y_pred_sarcasm = np.argmax(y_pred_sarcasm_prob, axis=1)
        y_pred_sentiment = np.argmax(y_pred_sentiment_prob, axis=1)
        
        # Sarcasm detection metrics
        print(f"\n=== SARCASM DETECTION PERFORMANCE ===")
        sarcasm_accuracy = accuracy_score(y_val_sarcasm, y_pred_sarcasm)
        sarcasm_precision = precision_score(y_val_sarcasm, y_pred_sarcasm, average='weighted')
        sarcasm_recall = recall_score(y_val_sarcasm, y_pred_sarcasm, average='weighted')
        sarcasm_f1 = f1_score(y_val_sarcasm, y_pred_sarcasm, average='weighted')
        
        print(f"Accuracy: {sarcasm_accuracy:.4f}")
        print(f"Precision: {sarcasm_precision:.4f}")
        print(f"Recall: {sarcasm_recall:.4f}")
        print(f"F1-Score: {sarcasm_f1:.4f}")
        print(classification_report(y_val_sarcasm, y_pred_sarcasm, 
                                   target_names=['Literal', 'Figurative (Sarcasm/Irony)']))
        
        # Sentiment analysis metrics
        print(f"\n=== SENTIMENT ANALYSIS PERFORMANCE ===")
        sentiment_accuracy = accuracy_score(y_val_sentiment, y_pred_sentiment)
        sentiment_precision = precision_score(y_val_sentiment, y_pred_sentiment, average='weighted')
        sentiment_recall = recall_score(y_val_sentiment, y_pred_sentiment, average='weighted')
        sentiment_f1 = f1_score(y_val_sentiment, y_pred_sentiment, average='weighted')
        
        print(f"Accuracy: {sentiment_accuracy:.4f}")
        print(f"Precision: {sentiment_precision:.4f}")
        print(f"Recall: {sentiment_recall:.4f}")
        print(f"F1-Score: {sentiment_f1:.4f}")
        print(classification_report(y_val_sentiment, y_pred_sentiment, 
                                   target_names=['Negative', 'Positive']))
        
        # Create confusion matrices
        fig, (ax1, ax2) = plt.subplots(1, 2, figsize=(16, 6))
        
        # Sarcasm confusion matrix
        cm_sarcasm = confusion_matrix(y_val_sarcasm, y_pred_sarcasm)
        sns.heatmap(cm_sarcasm, annot=True, fmt='d', cmap='Blues', ax=ax1,
                   xticklabels=['Literal', 'Figurative'],
                   yticklabels=['Literal', 'Figurative'])
        ax1.set_title('Sarcasm/Irony Detection - Confusion Matrix')
        ax1.set_ylabel('True Label')
        ax1.set_xlabel('Predicted Label')
        
        # Sentiment confusion matrix
        cm_sentiment = confusion_matrix(y_val_sentiment, y_pred_sentiment)
        sns.heatmap(cm_sentiment, annot=True, fmt='d', cmap='Greens', ax=ax2,
                   xticklabels=['Negative', 'Positive'],
                   yticklabels=['Negative', 'Positive'])
        ax2.set_title('Sentiment Analysis - Confusion Matrix')
        ax2.set_ylabel('True Label')
        ax2.set_xlabel('Predicted Label')
        
        plt.tight_layout()
        plt.show()
        
        return {
            'sarcasm': {
                'accuracy': sarcasm_accuracy,
                'precision': sarcasm_precision,
                'recall': sarcasm_recall,
                'f1': sarcasm_f1
            },
            'sentiment': {
                'accuracy': sentiment_accuracy,
                'precision': sentiment_precision,
                'recall': sentiment_recall,
                'f1': sentiment_f1
            }
        }
    
    def predict_sentiment(self, text):
        """Predict sentiment for new text with sarcasm-aware interpretation"""
        if self.model is None or self.tokenizer is None:
            raise ValueError("Model not trained yet!")
        
        # Clean the text
        clean_text = self.advanced_clean_tweet(text)
        
        # Convert to sequence
        sequence = self.tokenizer.texts_to_sequences([clean_text])
        padded_sequence = pad_sequences(sequence, maxlen=self.max_length, padding='post', truncating='post')
        
        # Check if model is multi-task or single-task
        if isinstance(self.model.output, list):
            # Multi-task model
            predictions = self.model.predict(padded_sequence, verbose=0)
            sarcasm_prob = predictions[0][0]
            sentiment_prob = predictions[1][0]
            
            sarcasm_label = np.argmax(sarcasm_prob)
            sarcasm_confidence = np.max(sarcasm_prob)
            is_sarcastic = sarcasm_label == 1
            
            raw_sentiment = np.argmax(sentiment_prob)
            raw_sentiment_confidence = np.max(sentiment_prob)
            
            # SARCASM INTERPRETATION: Treat sarcasm/irony as negative sentiment
            # When sarcasm is detected with high confidence, interpret as negative
            if is_sarcastic and sarcasm_confidence > 0.55:  # Threshold for sarcasm detection
                # Sarcasm detected - treat as negative sentiment
                final_sentiment = 0  # Negative
                final_sentiment_label = "Negative"
                
                # Adjust confidence based on sarcasm confidence
                # Higher sarcasm confidence = higher certainty it's negative
                final_confidence = float(sarcasm_confidence * 0.7 + (1 - sentiment_prob[1]) * 0.3)
                
                sentiment_note = " (sarcasm/irony detected - interpreted as negative)"
                
                # Adjusted probabilities reflecting sarcasm interpretation
                adjusted_neg_prob = min(0.95, sarcasm_confidence * 0.8 + sentiment_prob[0] * 0.2)
                adjusted_pos_prob = 1 - adjusted_neg_prob
                
            else:
                # No significant sarcasm - use raw sentiment prediction
                final_sentiment = raw_sentiment
                final_sentiment_label = "Positive" if final_sentiment == 1 else "Negative"
                final_confidence = float(raw_sentiment_confidence)
                sentiment_note = ""
                adjusted_neg_prob = float(sentiment_prob[0])
                adjusted_pos_prob = float(sentiment_prob[1])
            
            return {
                'text': text,
                'clean_text': clean_text,
                'is_sarcastic': is_sarcastic,
                'sarcasm_confidence': float(sarcasm_confidence),
                'sarcasm_probabilities': {
                    'literal': float(sarcasm_prob[0]),
                    'figurative': float(sarcasm_prob[1])
                },
                'sentiment': final_sentiment_label + sentiment_note,
                'sentiment_value': final_sentiment,  # 0=Negative, 1=Positive
                'sentiment_confidence': final_confidence,
                'sentiment_probabilities': {
                    'negative': float(adjusted_neg_prob),
                    'positive': float(adjusted_pos_prob)
                },
                'raw_sentiment': {
                    'label': "Positive" if raw_sentiment == 1 else "Negative",
                    'confidence': float(raw_sentiment_confidence),
                    'probabilities': {
                        'negative': float(sentiment_prob[0]),
                        'positive': float(sentiment_prob[1])
                    }
                }
            }
        else:
            # Single-task model (backward compatibility)
            prediction = self.model.predict(padded_sequence, verbose=0)
            sentiment = np.argmax(prediction[0])
            confidence = np.max(prediction[0])
            
            sentiment_label = "Positive" if sentiment == 1 else "Negative"
            
            return {
                'text': text,
                'clean_text': clean_text,
                'sentiment': sentiment_label,
                'sentiment_value': sentiment,
                'confidence': confidence,
                'probabilities': {
                    'negative': prediction[0][0],
                    'positive': prediction[0][1]
                }
            }

def main_multitask():
    """Main function to run Multi-Task BiLSTM with Sarcasm Detection and Sentiment Analysis"""
    print("=== MULTI-TASK BiLSTM: SARCASM DETECTION + SENTIMENT ANALYSIS ===\n")
    
    # Initialize the model
    bilstm = BiLSTMWithEmbeddings(vocab_size=25000, max_length=120, embedding_dim=200)
    
    # Download and load GloVe embeddings
    print("\n[1] Loading GloVe Embeddings...")
    glove_file = bilstm.download_glove_embeddings(embedding_dim=200)
    embeddings_index = bilstm.load_glove_embeddings(glove_file)
    
    # Load sentiment analysis data
    print("\n[2] Loading Sentiment Analysis Data...")
    sentiment_train, sentiment_test = bilstm.load_and_preprocess_data('train.csv', 'test.csv')
    
    # Load sarcasm/irony detection data
    print("\n[3] Loading Sarcasm/Irony Detection Data...")
    sarcasm_train, sarcasm_test = bilstm.load_sarcasm_data('archive/train.csv', 'archive/test.csv')
    
    # Merge datasets - use sarcasm data for both tasks
    # For sentiment, we'll use the sentiment dataset labels
    # For sarcasm, we'll use 0 (literal) for sentiment dataset and actual labels for sarcasm dataset
    print("\n[4] Combining Datasets...")
    
    # Prepare sentiment dataset with sarcasm label = 0 (literal)
    sentiment_train['sarcasm_label'] = 0  # Assume sentiment data is literal
    sentiment_combined = sentiment_train[['clean_tweet', 'label', 'sarcasm_label']].copy()
    sentiment_combined.columns = ['clean_tweet', 'sentiment_label', 'sarcasm_label']
    
    # Prepare sarcasm dataset
    # IMPORTANT: Sarcastic/ironic tweets are labeled as NEGATIVE sentiment
    # This is because sarcasm typically expresses negative sentiment through positive words
    def infer_sentiment_for_sarcasm(text, is_sarcastic):
        """
        Infer sentiment with sarcasm awareness
        - If sarcastic (is_sarcastic=1): Always label as NEGATIVE (0)
        - If literal (is_sarcastic=0): Infer from keywords
        """
        if is_sarcastic == 1:
            # Sarcastic/ironic content is treated as negative sentiment
            return 0
        else:
            # Literal content - infer from keywords
            positive_words = ['love', 'great', 'good', 'best', 'amazing', 'fantastic', 'excellent', 'happy', 'perfect', 'wonderful']
            negative_words = ['hate', 'bad', 'worst', 'terrible', 'awful', 'horrible', 'poor', 'disappointing', 'sad', 'disappointed']
            
            text_lower = text.lower()
            pos_count = sum(1 for word in positive_words if word in text_lower)
            neg_count = sum(1 for word in negative_words if word in text_lower)
            
            if pos_count > neg_count:
                return 1
            elif neg_count > pos_count:
                return 0
            else:
                # Neutral - slightly favor negative for safety
                return 0
    
    sarcasm_train['sentiment_label'] = sarcasm_train.apply(
        lambda row: infer_sentiment_for_sarcasm(row['clean_tweet'], row['sarcasm_label']), 
        axis=1
    )
    sarcasm_combined = sarcasm_train[['clean_tweet', 'sentiment_label', 'sarcasm_label']].copy()
    
    print(f"Sarcasm dataset - Sentiment distribution:")
    print(f"  Figurative (sarcastic) tweets labeled as negative: "
          f"{sum((sarcasm_combined['sarcasm_label'] == 1) & (sarcasm_combined['sentiment_label'] == 0))}")
    print(f"  Literal positive tweets: "
          f"{sum((sarcasm_combined['sarcasm_label'] == 0) & (sarcasm_combined['sentiment_label'] == 1))}")
    print(f"  Literal negative tweets: "
          f"{sum((sarcasm_combined['sarcasm_label'] == 0) & (sarcasm_combined['sentiment_label'] == 0))}")
    
    # Combine both datasets
    combined_train = pd.concat([sentiment_combined, sarcasm_combined], ignore_index=True)
    combined_train = combined_train.sample(frac=1, random_state=42).reset_index(drop=True)  # Shuffle
    
    print(f"Combined dataset size: {len(combined_train)}")
    print(f"Sentiment distribution: {combined_train['sentiment_label'].value_counts().to_dict()}")
    print(f"Sarcasm distribution: {combined_train['sarcasm_label'].value_counts().to_dict()}")
    
    # Prepare tokenizer and sequences
    print("\n[5] Preparing Sequences...")
    bilstm.tokenizer = Tokenizer(
        num_words=bilstm.vocab_size,
        oov_token="<OOV>",
        filters='!"#$%&()*+,-./:;<=>?@[\\]^_`{|}~\t\n'
    )
    bilstm.tokenizer.fit_on_texts(combined_train['clean_tweet'])
    
    train_sequences = bilstm.tokenizer.texts_to_sequences(combined_train['clean_tweet'])
    X_combined = pad_sequences(train_sequences, maxlen=bilstm.max_length, padding='post', truncating='post')
    y_sentiment = combined_train['sentiment_label'].values
    y_sarcasm = combined_train['sarcasm_label'].values
    
    print(f"Vocabulary size: {len(bilstm.tokenizer.word_index)}")
    print(f"Sequences shape: {X_combined.shape}")
    
    # Create embedding matrix
    print("\n[6] Creating Embedding Matrix...")
    bilstm.embedding_matrix = bilstm.create_embedding_matrix(
        bilstm.tokenizer.word_index, embeddings_index
    )
    
    # Train-validation split
    print("\n[7] Splitting Data...")
    indices = np.arange(len(X_combined))
    X_train, X_val, y_sent_train, y_sent_val, y_sarc_train, y_sarc_val, idx_train, idx_val = train_test_split(
        X_combined, y_sentiment, y_sarcasm, indices, 
        test_size=0.2, random_state=42, stratify=y_sarcasm
    )
    
    print(f"Training samples: {X_train.shape[0]}")
    print(f"Validation samples: {X_val.shape[0]}")
    
    # Build multi-task model
    print("\n[8] Building Multi-Task Model...")
    model = bilstm.build_multitask_model()
    print(model.summary())
    
    # Train multi-task model
    print("\n[9] Training Multi-Task Model...")
    history = bilstm.train_multitask_model(
        X_train, y_sarc_train, y_sent_train,
        X_val, y_sarc_val, y_sent_val,
        epochs=30
    )
    
    # Evaluate model
    print("\n[10] Evaluating Model...")
    metrics = bilstm.evaluate_multitask_model(X_val, y_sarc_val, y_sent_val)
    
    # Plot training history
    print("\n[11] Plotting Training History...")
    fig, axes = plt.subplots(2, 2, figsize=(16, 12))
    
    # Sarcasm accuracy
    axes[0, 0].plot(history.history['sarcasm_output_accuracy'], label='Train')
    axes[0, 0].plot(history.history['val_sarcasm_output_accuracy'], label='Validation')
    axes[0, 0].set_title('Sarcasm Detection Accuracy')
    axes[0, 0].set_xlabel('Epoch')
    axes[0, 0].set_ylabel('Accuracy')
    axes[0, 0].legend()
    axes[0, 0].grid(True)
    
    # Sarcasm loss
    axes[0, 1].plot(history.history['sarcasm_output_loss'], label='Train')
    axes[0, 1].plot(history.history['val_sarcasm_output_loss'], label='Validation')
    axes[0, 1].set_title('Sarcasm Detection Loss')
    axes[0, 1].set_xlabel('Epoch')
    axes[0, 1].set_ylabel('Loss')
    axes[0, 1].legend()
    axes[0, 1].grid(True)
    
    # Sentiment accuracy
    axes[1, 0].plot(history.history['sentiment_output_accuracy'], label='Train')
    axes[1, 0].plot(history.history['val_sentiment_output_accuracy'], label='Validation')
    axes[1, 0].set_title('Sentiment Analysis Accuracy')
    axes[1, 0].set_xlabel('Epoch')
    axes[1, 0].set_ylabel('Accuracy')
    axes[1, 0].legend()
    axes[1, 0].grid(True)
    
    # Sentiment loss
    axes[1, 1].plot(history.history['sentiment_output_loss'], label='Train')
    axes[1, 1].plot(history.history['val_sentiment_output_loss'], label='Validation')
    axes[1, 1].set_title('Sentiment Analysis Loss')
    axes[1, 1].set_xlabel('Epoch')
    axes[1, 1].set_ylabel('Loss')
    axes[1, 1].legend()
    axes[1, 1].grid(True)
    
    plt.tight_layout()
    plt.show()
    
    # Test with sample predictions
    print("\n[12] Testing Sample Predictions...")
    print("\n=== SAMPLE PREDICTIONS ===")
    sample_texts = [
        # Genuine positive
        "I love this product! It's absolutely amazing!",
        "This is the best thing ever! I'm so happy!",
        "Absolutely fantastic experience! Highly recommended!",
        
        # Genuine negative
        "This is terrible, worst purchase ever",
        "Waste of money, completely disappointed",
        
        # Sarcastic/Ironic
        "Oh great, another wonderful day stuck in traffic #sarcasm",
        "Yeah, because that's exactly what I needed today... #irony",
        "Love how my phone died right before my presentation. Perfect timing!",
        "Such a great product! It broke after one day. Amazing quality! #sarcasm",
        "Oh wonderful, it's raining again. Just fantastic.",
        
        # Neutral/Mixed
        "The service was okay, nothing special",
        "Not bad, but could be better",
        "Pretty good overall, satisfied with the purchase"
    ]
    
    for i, text in enumerate(sample_texts, 1):
        print(f"\n[{i}] Text: {text}")
        result = bilstm.predict_sentiment(text)
        print(f"    Sarcasm: {'YES' if result['is_sarcastic'] else 'NO'} "
              f"(Confidence: {result['sarcasm_confidence']:.3f})")
        print(f"    Sentiment: {result['sentiment']} "
              f"(Confidence: {result['sentiment_confidence']:.3f})")
        print("-" * 80)
    
    print("\n=== TRAINING COMPLETE ===")
    print(f"\nFinal Metrics:")
    print(f"Sarcasm Detection - Accuracy: {metrics['sarcasm']['accuracy']:.4f}, F1: {metrics['sarcasm']['f1']:.4f}")
    print(f"Sentiment Analysis - Accuracy: {metrics['sentiment']['accuracy']:.4f}, F1: {metrics['sentiment']['f1']:.4f}")
    
    return bilstm, history, metrics

def main():
    """Legacy main function for backward compatibility"""
    print("NOTE: This script now supports multi-task learning with sarcasm detection.")
    print("Use main_multitask() for the enhanced model.\n")
    return main_multitask()

if __name__ == "__main__":
    main()
