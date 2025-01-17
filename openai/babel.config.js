module.exports = {
  presets: ['module:metro-react-native-babel-preset'],
  plugins: [
    ['module:react-native-dotenv', {
      moduleName: '@env',
      path: '.env',
    }],
    [
      'module-resolver',
      {
        extensions: ['.ios.js', '.android.js', '.js', '.json'],
        root: ['.'],
        alias: {
          'chatbot': './chatbot',
          'screens': './src/screens',
          'simulation': './src/screens/Simulation',
          '@': './',
        },
      },
    ],
    ['@babel/plugin-transform-private-methods', { loose: true }], // loose 모드 설정
    ['@babel/plugin-transform-class-properties', { loose: true }], // loose 모드 설정
    ['@babel/plugin-transform-private-property-in-object', { loose: true }], // loose 모드 설정
  ],
};
