import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import * as Colors from '../constants/colors';
import { SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT } from '../constants/spacing';
import Button from './Button';

const QuizCard = ({
  questionNumber,
  totalQuestions,
  question,
  options,
  correctAnswer,
  hint,
  hintCost = 5,
  pointsValue = 60,
  onAnswerSubmit,
  onContinue,
  currentPoints,
}) => {
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showHint, setShowHint] = useState(false);
  const [isAnswered, setIsAnswered] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);

  const handleAnswerSelect = (option) => {
    if (!isAnswered) {
      setSelectedAnswer(option);
    }
  };

  const handleCheckAnswer = () => {
    const correct = selectedAnswer === correctAnswer;
    setIsCorrect(correct);
    setIsAnswered(true);
    
    const earnedPoints = correct ? pointsValue : 5;
    if (onAnswerSubmit) {
      onAnswerSubmit({
        correct,
        selectedAnswer,
        earnedPoints,
      });
    }
  };

  const handleHint = () => {
    setShowHint(true);
    // Deduct hint cost from points
  };

  const renderOption = (option) => {
    const isSelected = selectedAnswer === option;
    const isCorrectOption = option === correctAnswer;
    
    let optionStyle = [styles.option];
    let optionTextStyle = [styles.optionText];
    let iconComponent = null;

    if (isAnswered) {
      if (isCorrectOption) {
        optionStyle.push(styles.optionCorrect);
        optionTextStyle.push(styles.optionTextCorrect);
        iconComponent = <Text style={styles.checkIcon}>✓</Text>;
      } else if (isSelected && !isCorrect) {
        optionStyle.push(styles.optionIncorrect);
        optionTextStyle.push(styles.optionTextIncorrect);
        iconComponent = <Text style={styles.crossIcon}>✕</Text>;
      }
    } else if (isSelected) {
      optionStyle.push(styles.optionSelected);
    }

    return (
      <TouchableOpacity
        key={option}
        style={optionStyle}
        onPress={() => handleAnswerSelect(option)}
        disabled={isAnswered}
      >
        <View style={styles.optionContent}>
          <Text style={optionTextStyle}>{option}</Text>
          {iconComponent}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Question Header */}
      <View style={styles.header}>
        <Text style={styles.questionNumber}>
          Q{questionNumber}/{totalQuestions}
        </Text>
        {currentPoints !== undefined && (
          <View style={styles.pointsBadge}>
            <Text style={styles.pointsText}>{currentPoints}</Text>
          </View>
        )}
      </View>

      {/* Feedback Banner */}
      {isAnswered && (
        <View style={[styles.feedbackBanner, isCorrect ? styles.correctBanner : styles.incorrectBanner]}>
          <Text style={styles.feedbackText}>
            {isCorrect ? 'Correct! 🎉' : 'Oops! 😅'}
          </Text>
        </View>
      )}

      {/* Question */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.question}>{question}</Text>

        {/* Hint Section */}
        {hint && !showHint && !isAnswered && (
          <TouchableOpacity style={styles.hintButton} onPress={handleHint}>
            <Text style={styles.hintButtonText}>💡 Need Hint? -{hintCost}</Text>
          </TouchableOpacity>
        )}

        {showHint && (
          <View style={styles.hintBox}>
            <Text style={styles.hintLabel}>HINT:</Text>
            <Text style={styles.hintText}>{hint}</Text>
          </View>
        )}

        {/* Options */}
        <View style={styles.optionsContainer}>
          {options.map(renderOption)}
        </View>

        {/* Explanation (shown after answering) */}
        {isAnswered && (
          <View style={styles.explanationBox}>
            <Text style={styles.explanationText}>
              {isCorrect
                ? `Great job! You earned ${pointsValue} points!`
                : `You earned 5 points for trying. The correct answer is: ${correctAnswer}`}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* Action Button */}
      <View style={styles.footer}>
        {!isAnswered ? (
          <Button
            variant="primary"
            fullWidth
            disabled={!selectedAnswer}
            onPress={handleCheckAnswer}
          >
            Check the answer
          </Button>
        ) : (
          <Button
            variant="primary"
            fullWidth
            onPress={onContinue}
          >
            +{isCorrect ? pointsValue : 5}p {questionNumber === totalQuestions ? 'See Results!' : 'Continue'}
          </Button>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.BACKGROUND_WHITE,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SPACING.lg,
    borderBottomWidth: 1,
    borderBottomColor: Colors.BORDER_LIGHT,
  },
  questionNumber: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: Colors.TEXT_PRIMARY,
  },
  pointsBadge: {
    backgroundColor: Colors.SECONDARY,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: RADIUS.round,
  },
  pointsText: {
    color: Colors.TEXT_WHITE,
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
  },
  feedbackBanner: {
    padding: SPACING.md,
    alignItems: 'center',
  },
  correctBanner: {
    backgroundColor: Colors.SUCCESS_BG,
  },
  incorrectBanner: {
    backgroundColor: Colors.ERROR_LIGHT + '20',
  },
  feedbackText: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.bold,
    color: Colors.TEXT_PRIMARY,
  },
  content: {
    flex: 1,
    padding: SPACING.lg,
  },
  question: {
    fontSize: FONT_SIZE.xl,
    fontWeight: FONT_WEIGHT.semibold,
    color: Colors.TEXT_PRIMARY,
    marginBottom: SPACING.lg,
    lineHeight: 28,
  },
  hintButton: {
    backgroundColor: Colors.SECONDARY,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: RADIUS.md,
    alignSelf: 'flex-start',
    marginBottom: SPACING.lg,
  },
  hintButtonText: {
    color: Colors.TEXT_WHITE,
    fontSize: FONT_SIZE.md,
    fontWeight: FONT_WEIGHT.semibold,
  },
  hintBox: {
    backgroundColor: Colors.INFO + '15',
    borderLeftWidth: 4,
    borderLeftColor: Colors.INFO,
    padding: SPACING.md,
    borderRadius: RADIUS.sm,
    marginBottom: SPACING.lg,
  },
  hintLabel: {
    fontSize: FONT_SIZE.sm,
    fontWeight: FONT_WEIGHT.bold,
    color: Colors.INFO,
    marginBottom: 4,
  },
  hintText: {
    fontSize: FONT_SIZE.md,
    color: Colors.TEXT_SECONDARY,
    lineHeight: 20,
  },
  optionsContainer: {
    gap: SPACING.md,
  },
  option: {
    backgroundColor: Colors.BACKGROUND_WHITE,
    borderWidth: 2,
    borderColor: Colors.BORDER_LIGHT,
    borderRadius: RADIUS.md,
    padding: SPACING.lg,
  },
  optionSelected: {
    borderColor: Colors.SECONDARY,
    backgroundColor: Colors.SECONDARY + '10',
  },
  optionCorrect: {
    borderColor: Colors.SUCCESS,
    backgroundColor: Colors.SUCCESS_BG,
  },
  optionIncorrect: {
    borderColor: Colors.ERROR,
    backgroundColor: Colors.ERROR + '15',
  },
  optionContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  optionText: {
    fontSize: FONT_SIZE.lg,
    color: Colors.TEXT_PRIMARY,
    fontWeight: FONT_WEIGHT.medium,
    flex: 1,
  },
  optionTextCorrect: {
    color: Colors.SUCCESS,
    fontWeight: FONT_WEIGHT.bold,
  },
  optionTextIncorrect: {
    color: Colors.ERROR,
  },
  checkIcon: {
    fontSize: 24,
    color: Colors.SUCCESS,
    fontWeight: FONT_WEIGHT.bold,
  },
  crossIcon: {
    fontSize: 24,
    color: Colors.ERROR,
    fontWeight: FONT_WEIGHT.bold,
  },
  explanationBox: {
    backgroundColor: Colors.GRAY_100,
    padding: SPACING.md,
    borderRadius: RADIUS.md,
    marginTop: SPACING.lg,
  },
  explanationText: {
    fontSize: FONT_SIZE.md,
    color: Colors.TEXT_SECONDARY,
    lineHeight: 20,
  },
  footer: {
    padding: SPACING.lg,
    borderTopWidth: 1,
    borderTopColor: Colors.BORDER_LIGHT,
  },
});

export default QuizCard;

