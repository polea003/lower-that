import readline from 'readline';
import { CONTENT_TYPES, USER_MENU_OPTIONS } from '../config/constants.js';
import { logger } from '../utils/logger.js';

const createInterface = () => readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const closeInterface = (rl) => {
  rl.close();
  return rl;
};

const promisifyQuestion = (rl) => (question) => 
  new Promise((resolve) => {
    rl.question(question, (answer) => {
      closeInterface(rl);
      resolve(answer.trim());
    });
  });

const askQuestion = (question) => {
  const rl = createInterface();
  return promisifyQuestion(rl)(question);
};

const displayMenu = () => {
  console.log('What are you watching?');
  console.log(`  ${USER_MENU_OPTIONS.SPORTING_EVENT}) Sporting event`);
  console.log(`  ${USER_MENU_OPTIONS.BLACK_WHITE_MOVIE}) Black & white movie`);
  console.log(`  ${USER_MENU_OPTIONS.CUSTOM}) Custom`);
};

const logUserSelection = (selection) => logger.info('User selected:', selection);
const logCustomDescription = (description) => logger.info('User provided custom description:', description);
const logInvalidSelection = () => logger.warn('Invalid selection, defaulting to sporting event');
const logPromptStart = () => logger.info('Prompting user to select content type...');

const mapChoiceToContent = (choice) => {
  switch (choice) {
    case USER_MENU_OPTIONS.SPORTING_EVENT:
      logUserSelection('Sporting event');
      return CONTENT_TYPES.SPORTING_EVENT;
      
    case USER_MENU_OPTIONS.BLACK_WHITE_MOVIE:
      logUserSelection('Black & white movie');
      return CONTENT_TYPES.BLACK_WHITE_MOVIE;
      
    case USER_MENU_OPTIONS.CUSTOM:
      return 'CUSTOM_PROMPT_NEEDED';
      
    default:
      logInvalidSelection();
      return CONTENT_TYPES.SPORTING_EVENT;
  }
};

const handleCustomContent = async () => {
  const customDescription = await askQuestion('Enter your custom description: ');
  const value = (customDescription || '').trim();
  if (value) {
    logCustomDescription(value);
    return value;
  }
  logInvalidSelection();
  return CONTENT_TYPES.SPORTING_EVENT;
};

const selectContentType = async () => {
  logPromptStart();
  displayMenu();
  
  const choice = await askQuestion('> ');
  const contentType = mapChoiceToContent(choice);
  
  return contentType === 'CUSTOM_PROMPT_NEEDED' 
    ? await handleCustomContent()
    : contentType;
};

const createUserPrompts = () => ({
  askQuestion,
  selectContentType
});

export const userPrompts = createUserPrompts();
