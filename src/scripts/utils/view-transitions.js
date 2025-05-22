// file: view-transitions.js
export default class ViewTransition {
    static _checkSupport() {
      return Boolean(document.startViewTransition);
    }
    
    static async transition(callback) {
      if (!this._checkSupport()) {
        return callback();
      }
      
      try {
        // Start the view transition
        const transition = document.startViewTransition(async () => {
          // Your DOM updates go here
          await callback();
        });
        
        // Wait for the transition to complete
        await transition.finished;
      } catch (error) {
        console.error('View Transition error:', error);
        // Fallback to normal update without transitions
        await callback();
      }
    }
  }