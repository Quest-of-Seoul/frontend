import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    TouchableOpacity,
    Image,
    Modal,
    ActivityIndicator,
    Alert,
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import * as Colors from '../constants/colors';
import { SPACING, RADIUS, FONT_SIZE, FONT_WEIGHT } from '../constants/spacing';
import QuizCard from '../components/QuizCard';
import Button from '../components/Button';
import { getCurrentUser } from '../utils/supabase';
import { addPoints, getQuestDetailRecommend } from '../api/fastapi';

const QuizScreen = ({ navigation, route }) => {
    const { quest } = route.params || {};
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
    const [totalPoints, setTotalPoints] = useState(0);
    const [correctAnswers, setCorrectAnswers] = useState(0);
    const [quizStarted, setQuizStarted] = useState(false);
    const [quizCompleted, setQuizCompleted] = useState(false);
    const [quizData, setQuizData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [userId, setUserId] = useState(null);

    useEffect(() => {
        loadQuizData();
    }, []);

    const loadQuizData = async () => {
        try {
            const user = await getCurrentUser();
            setUserId(user?.id);

            if (!quest?.quest_id && !quest?.id) {
                throw new Error('퀘스트 정보가 없습니다.');
            }

            const questDetail = await getQuestDetailRecommend(quest.quest_id || quest.id);

            if (!questDetail.success || !questDetail.quizzes || questDetail.quizzes.length === 0) {
                throw new Error('퀴즈 데이터를 찾을 수 없습니다.');
            }

            const formattedData = {
                placeId: questDetail.place?.id,
                placeName: questDetail.place?.name || quest.title || quest.name,
                totalPoints: questDetail.quizzes.reduce((sum, q) => sum + (q.points || 60), 0),
                questions: questDetail.quizzes.map((q, idx) => ({
                    id: q.id || idx + 1,
                    question: q.question,
                    options: q.options,
                    correctAnswer: q.options[q.correct_answer],
                    hint: q.hint,
                    points: q.points || 60,
                    explanation: q.explanation,
                })),
            };
            setQuizData(formattedData);
        } catch (error) {
            console.error('Error loading quiz data:', error);
            Alert.alert(
                '오류',
                '퀴즈를 불러올 수 없습니다.',
                [{ text: '확인', onPress: () => navigation.goBack() }]
            );
        } finally {
            setLoading(false);
        }
    };

    if (loading || !quizData) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={[styles.startContent, { justifyContent: 'center' }]}>
                    <ActivityIndicator size="large" color={Colors.PRIMARY} />
                </View>
            </SafeAreaView>
        );
    }

    const currentQuestion = quizData.questions[currentQuestionIndex];
    const progress = ((currentQuestionIndex + 1) / quizData.questions.length) * 100;

    const handleStart = () => {
        setQuizStarted(true);
    };

    const handleAnswerSubmit = (result) => {
        if (result.correct) {
            setCorrectAnswers(correctAnswers + 1);
        }
        setTotalPoints(totalPoints + result.earnedPoints);
    };

    const handleContinue = async () => {
        if (currentQuestionIndex < quizData.questions.length - 1) {
            setCurrentQuestionIndex(currentQuestionIndex + 1);
        } else {
            if (userId && totalPoints > 0) {
                try {
                    await addPoints(userId, totalPoints, `Quiz completed: ${quizData.placeName}`);
                } catch (error) {
                    console.error('Error adding quiz points:', error);
                }
            }
            setQuizCompleted(true);
        }
    };

    const handleClose = () => {
        navigation.goBack();
    };

    const handleDiscoverMore = () => {
        navigation.navigate('Quest', { selectedQuest: quest });
    };

    const handleNextDestination = () => {
        navigation.navigate('Home');
    };

    // Quiz Start Screen
    if (!quizStarted) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                        <Text style={styles.closeButtonText}>✕</Text>
                    </TouchableOpacity>
                    <View style={styles.pointsBadge}>
                        <Text style={styles.pointsBadgeText}>🪙 25</Text>
                    </View>
                </View>

                <View style={styles.startContent}>
                    <Text style={styles.startTitle}>Quest Time</Text>

                    <Text style={styles.placeName}>{quizData.placeName}</Text>

                    <View style={styles.quizInfo}>
                        <Text style={styles.totalPoints}>Total {quizData.totalPoints} pts</Text>
                        <Text style={styles.questionCount}>
                            {quizData.questions.length} questions × {quizData.questions[0].points} pts each
                        </Text>
                    </View>

                    <Button
                        variant="primary"
                        size="large"
                        onPress={handleStart}
                        fullWidth
                        style={styles.startButton}
                    >
                        START!
                    </Button>
                </View>
            </SafeAreaView>
        );
    }

    // Quiz Completed Screen
    if (quizCompleted) {
        return (
            <SafeAreaView style={styles.container}>
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                        <Text style={styles.closeButtonText}>←</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerTitle}>Share Result</Text>
                </View>

                <View style={styles.resultContent}>
                    <View style={styles.completedBadge}>
                        <Text style={styles.completedText}>🏆 Quest Completed!</Text>
                    </View>

                    <View style={styles.scoreContainer}>
                        <Text style={styles.scoreLabel}>Your Score</Text>
                        <Text style={styles.scoreValue}>
                            {correctAnswers}/{quizData.questions.length}
                        </Text>
                        <Text style={styles.pointsEarned}>{totalPoints}/{quizData.totalPoints}</Text>
                    </View>

                    <View style={styles.progressDots}>
                        {quizData.questions.map((_, index) => (
                            <View
                                key={index}
                                style={[
                                    styles.dot,
                                    index < correctAnswers && styles.dotCompleted,
                                ]}
                            />
                        ))}
                    </View>

                    <View style={styles.resultActions}>
                        <Button
                            variant="outline"
                            onPress={handleDiscoverMore}
                            fullWidth
                            style={styles.actionButton}
                        >
                            Discover this place more
                        </Button>

                        <Button
                            variant="primary"
                            onPress={handleNextDestination}
                            fullWidth
                            style={styles.actionButton}
                        >
                            Move on to next destination
                        </Button>

                        <TouchableOpacity style={styles.cameraRollButton}>
                            <Text style={styles.cameraRollText}>📷 Select from Camera Roll</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </SafeAreaView>
        );
    }

    // Quiz Question Screen
    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.header}>
                <TouchableOpacity onPress={handleClose} style={styles.closeButton}>
                    <Text style={styles.closeButtonText}>✕</Text>
                </TouchableOpacity>
                <View style={styles.progressBar}>
                    <View style={[styles.progressFill, { width: `${progress}%` }]} />
                </View>
                <View style={styles.pointsBadge}>
                    <Text style={styles.pointsBadgeText}>{totalPoints}</Text>
                </View>
            </View>

            <QuizCard
                questionNumber={currentQuestionIndex + 1}
                totalQuestions={quizData.questions.length}
                question={currentQuestion.question}
                options={currentQuestion.options}
                correctAnswer={currentQuestion.correctAnswer}
                hint={currentQuestion.hint}
                pointsValue={currentQuestion.points}
                currentPoints={totalPoints}
                onAnswerSubmit={handleAnswerSubmit}
                onContinue={handleContinue}
            />
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.BACKGROUND_WHITE,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg,
        paddingVertical: SPACING.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.BORDER_LIGHT,
    },
    closeButton: {
        width: 36,
        height: 36,
        alignItems: 'center',
        justifyContent: 'center',
    },
    closeButtonText: {
        fontSize: 24,
        color: Colors.TEXT_PRIMARY,
    },
    headerTitle: {
        fontSize: FONT_SIZE.lg,
        fontWeight: FONT_WEIGHT.bold,
        color: Colors.TEXT_PRIMARY,
    },
    progressBar: {
        flex: 1,
        height: 4,
        backgroundColor: Colors.GRAY_200,
        borderRadius: 2,
        marginHorizontal: SPACING.md,
        overflow: 'hidden',
    },
    progressFill: {
        height: '100%',
        backgroundColor: Colors.SUCCESS,
    },
    pointsBadge: {
        backgroundColor: Colors.SECONDARY,
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: RADIUS.round,
    },
    pointsBadgeText: {
        color: Colors.TEXT_WHITE,
        fontSize: FONT_SIZE.sm,
        fontWeight: FONT_WEIGHT.bold,
    },

    // Start Screen
    startContent: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: SPACING.xl,
    },
    startTitle: {
        fontSize: 48,
        fontWeight: FONT_WEIGHT.bold,
        color: Colors.PRIMARY,
        marginBottom: SPACING.xxxl,
        letterSpacing: 2,
        textTransform: 'uppercase',
    },
    placeImage: {
        width: 200,
        height: 200,
        borderRadius: RADIUS.lg,
        marginBottom: SPACING.lg,
    },
    placeName: {
        fontSize: FONT_SIZE.xxl,
        fontWeight: FONT_WEIGHT.bold,
        color: Colors.TEXT_PRIMARY,
        marginBottom: SPACING.md,
    },
    quizInfo: {
        alignItems: 'center',
        marginBottom: SPACING.xxxl,
    },
    totalPoints: {
        fontSize: FONT_SIZE.xl,
        fontWeight: FONT_WEIGHT.bold,
        color: Colors.PRIMARY,
        marginBottom: 4,
    },
    questionCount: {
        fontSize: FONT_SIZE.md,
        color: Colors.TEXT_MUTED,
    },
    startButton: {
        marginTop: SPACING.xl,
    },

    // Result Screen
    resultContent: {
        flex: 1,
        padding: SPACING.xl,
        alignItems: 'center',
    },
    completedBadge: {
        backgroundColor: Colors.SUCCESS_BG,
        paddingVertical: SPACING.md,
        paddingHorizontal: SPACING.xl,
        borderRadius: RADIUS.lg,
        marginBottom: SPACING.xl,
    },
    completedText: {
        fontSize: FONT_SIZE.xl,
        fontWeight: FONT_WEIGHT.bold,
        color: Colors.SUCCESS,
    },
    scoreContainer: {
        alignItems: 'center',
        marginBottom: SPACING.lg,
    },
    scoreLabel: {
        fontSize: FONT_SIZE.md,
        color: Colors.TEXT_MUTED,
        marginBottom: 4,
    },
    scoreValue: {
        fontSize: 48,
        fontWeight: FONT_WEIGHT.bold,
        color: Colors.TEXT_PRIMARY,
    },
    pointsEarned: {
        fontSize: FONT_SIZE.xl,
        fontWeight: FONT_WEIGHT.semibold,
        color: Colors.PRIMARY,
    },
    progressDots: {
        flexDirection: 'row',
        gap: 8,
        marginBottom: SPACING.xl,
    },
    dot: {
        width: 12,
        height: 12,
        borderRadius: 6,
        backgroundColor: Colors.GRAY_300,
    },
    dotCompleted: {
        backgroundColor: Colors.SUCCESS,
    },
    resultImage: {
        width: '100%',
        height: 200,
        borderRadius: RADIUS.lg,
        marginBottom: SPACING.xl,
    },
    resultActions: {
        width: '100%',
        gap: SPACING.md,
    },
    actionButton: {
        marginBottom: 0,
    },
    cameraRollButton: {
        padding: SPACING.md,
        alignItems: 'center',
    },
    cameraRollText: {
        fontSize: FONT_SIZE.md,
        color: Colors.SECONDARY,
        fontWeight: FONT_WEIGHT.medium,
    },
});

export default QuizScreen;

