export const createNavigationHandlers = (navigation) => {
  return {
    navigateToHome: () => navigation.navigate('Home'),
    navigateToQuest: () => navigation.navigate('Quest'),
    navigateToAR: () => navigation.navigate('AR'),
    navigateToARChat: (params) => navigation.navigate('ARChat', params),
    navigateToQuiz: (params) => navigation.navigate('Quiz', params),
    navigateToReward: () => navigation.navigate('Reward'),
    navigateToMy: () => { },
    goBack: () => navigation.goBack(),
  };
};

export const navigationConfig = {
  screenOptions: {
    headerShown: false,
    gestureEnabled: true,
    cardStyleInterpolator: ({ current: { progress } }) => ({
      cardStyle: {
        opacity: progress,
      },
    }),
  },
};

export default {
  createNavigationHandlers,
  navigationConfig,
};

