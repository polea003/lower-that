import readline from 'readline';
import { CONTENT_TYPES, USER_MENU_OPTIONS } from '../config/constants.js';
import { logger } from '../utils/logger.js';
import { curry, tap, maybe } from '../utils/functional.js';

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

const logUserSelection = tap((selection) => logger.info('User selected:', selection));
const logCustomDescription = tap((description) => logger.info('User provided custom description:', description));
const logInvalidSelection = tap(() => logger.warn('Invalid selection, defaulting to sporting event'));
const logPromptStart = tap(() => logger.info('Prompting user to select content type...'));

const mapChoiceToContent = (choice) => {
  switch (choice) {
    case USER_MENU_OPTIONS.SPORTING_EVENT:
      return logUserSelection('Sporting event') || CONTENT_TYPES.SPORTING_EVENT;
      
    case USER_MENU_OPTIONS.BLACK_WHITE_MOVIE:
      return logUserSelection('Black & white movie') || CONTENT_TYPES.BLACK_WHITE_MOVIE;
      
    case USER_MENU_OPTIONS.CUSTOM:
      return 'CUSTOM_PROMPT_NEEDED';
      
    default:
      return logInvalidSelection() || CONTENT_TYPES.SPORTING_EVENT;
  }
};

const handleCustomContent = async () => {
  const customDescription = await askQuestion('Enter your custom description: ');
  return maybe(logCustomDescription)(customDescription) || CONTENT_TYPES.SPORTING_EVENT;
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