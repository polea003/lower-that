import readline from 'readline';
import { CONTENT_TYPES, USER_MENU_OPTIONS } from '../config/constants.js';
import { logger } from '../utils/logger.js';

class UserPrompts {
  constructor() {
    this.rl = null;
  }

  _createInterface() {
    if (!this.rl) {
      this.rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
      });
    }
    return this.rl;
  }

  _closeInterface() {
    if (this.rl) {
      this.rl.close();
      this.rl = null;
    }
  }

  async askQuestion(question) {
    const rl = this._createInterface();
    
    return new Promise((resolve) => {
      rl.question(question, (answer) => {
        this._closeInterface();
        resolve(answer.trim());
      });
    });
  }

  async selectContentType() {
    logger.info('Prompting user to select content type...');
    
    console.log('What are you watching?');
    console.log(`  ${USER_MENU_OPTIONS.SPORTING_EVENT}) Sporting event`);
    console.log(`  ${USER_MENU_OPTIONS.BLACK_WHITE_MOVIE}) Black & white movie`);
    console.log(`  ${USER_MENU_OPTIONS.CUSTOM}) Custom`);
    
    const choice = await this.askQuestion('> ');
    
    switch (choice) {
      case USER_MENU_OPTIONS.SPORTING_EVENT:
        logger.info('User selected: Sporting event');
        return CONTENT_TYPES.SPORTING_EVENT;
        
      case USER_MENU_OPTIONS.BLACK_WHITE_MOVIE:
        logger.info('User selected: Black & white movie');
        return CONTENT_TYPES.BLACK_WHITE_MOVIE;
        
      case USER_MENU_OPTIONS.CUSTOM:
        const customDescription = await this.askQuestion('Enter your custom description: ');
        logger.info('User provided custom description:', customDescription);
        return customDescription || CONTENT_TYPES.SPORTING_EVENT;
        
      default:
        logger.warn('Invalid selection, defaulting to sporting event');
        return CONTENT_TYPES.SPORTING_EVENT;
    }
  }
}

export const userPrompts = new UserPrompts();