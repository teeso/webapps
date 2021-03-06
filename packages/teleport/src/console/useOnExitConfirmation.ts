/**
 * Copyright 2020 Gravitational, Inc.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import React from 'react';
import ConsoleContext from './consoleContext';
import * as stores from './stores/types';

// TAB_MIN_AGE defines "active terminal" session in ms
const TAB_MIN_AGE = 30000;

/**
 * useOnExitConfirmation notifies users closing active terminal sessions by:
 *    refresh, window close, window tab close, session tab close.
 *
 * "active terminal" is defined by seconds the tab has been opened.
 *
 * @param ctx data that is shared between Console related components.
 */
function useOnExitConfirmation(ctx: ConsoleContext) {
  React.useEffect(() => {
    /**
     * handleBeforeUnload listens for browser closes and refreshes.
     * Checks if users need to be notified before closing based on type
     * of document opened and how long it has been active for.
     */
    const handleBeforeunload = event => {
      const shouldNotify = ctx.getDocuments().some(hasLastingSshConnection);

      if (shouldNotify) {
        // cancel event as set by standard, but not supported in all browsers
        event.preventDefault();
        // required in chrome
        event.returnValue = '';
      }
    };

    // add event listener on mount
    window.addEventListener('beforeunload', handleBeforeunload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeunload);
    };
  }, []);

  /**
   * confirmCloseSession prompts user to confirm to close.
   */
  function confirmCloseSession() {
    return window.confirm('Are you sure you want to terminate this session?');
  }

  /**
   * hasLastingSshConnection calculates the milliseconds between given date
   * from when fn was called.
   *
   * @param doc the document in context
   */
  function hasLastingSshConnection(doc: stores.Document) {
    if (doc.kind !== 'terminal' || doc.status !== 'connected') {
      return false;
    }

    const created = doc.created.getTime();
    const fromNow = new Date().getTime();

    return fromNow - created > TAB_MIN_AGE;
  }

  /**
   * verifyAndConfirm verifies the document is of type terminal,
   * and based on how long it was active for, prompts users to confirm closing.
   *
   * @param doc the document in context
   */
  function verifyAndConfirm(doc: stores.Document) {
    if (hasLastingSshConnection(doc)) {
      return confirmCloseSession();
    }

    return true;
  }

  return { verifyAndConfirm, hasLastingSshConnection };
}

export default useOnExitConfirmation;
