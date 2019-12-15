var TokenAutocomplete = /** @class */ (function () {
    function TokenAutocomplete(options) {
        if (options === void 0) { options = {}; }
        this.defaults = {
            initialTokens: [],
            initialSuggestions: [],
            minCharactersForSuggestion: 1
        };
        this.options = this.mergeOptions(this.defaults, options);
        this.container = document.querySelector(this.options.selector);
        this.container.classList.add('token-autocomplete-container');
        this.hiddenSelect = document.createElement('select');
        this.hiddenSelect.id = this.container.id + '-select';
        this.hiddenSelect.style.display = 'none';
        this.textInput = document.createElement('span');
        this.textInput.id = this.container.id + '-input';
        this.textInput.classList.add('token-autocomplete-input');
        this.textInput.setAttribute('data-placeholder', 'enter some text');
        this.textInput.contentEditable = true;
        this.suggestions = document.createElement('ul');
        this.suggestions.id = this.container.id + '-suggestions';
        this.suggestions.classList.add('token-autocomplete-suggestions');
        this.container.appendChild(this.textInput);
        this.container.appendChild(this.hiddenSelect);
        this.container.appendChild(this.suggestions);
        this.debug(false);
        var me = this;
        if (Array.isArray(this.options.initialTokens)) {
            this.options.initialTokens.forEach(function (token) {
                if (typeof token === 'string') {
                    me.addToken(token);
                }
            });
        }
        this.textInput.addEventListener('keydown', function (event) {
            if (event.which == 13 || event.keyCode == 13) {
                event.preventDefault();
                var highlightedSuggestion = me.suggestions.querySelector('.token-autocomplete-suggestion-highlighted');
                if (highlightedSuggestion !== null) {
                    if (highlightedSuggestion.classList.contains('token-autocomplete-suggestion-active')) {
                        me.removeTokenWithText(highlightedSuggestion.textContent);
                    }
                    else {
                        me.addToken(highlightedSuggestion.textContent);
                    }
                }
                else {
                    me.addToken(me.textInput.textContent);
                }
                me.clearCurrentInput();
            }
            else if (me.textInput.textContent === '' && (event.which == 8 || event.keyCode == 8)) {
                event.preventDefault();
                me.removeLastToken();
            }
        });
        this.textInput.addEventListener('keyup', function (event) {
            if ((event.which == 38 || event.keyCode == 38) && me.suggestions.childNodes.length > 0) {
                var highlightedSuggestion = me.suggestions.querySelector('.token-autocomplete-suggestion-highlighted');
                var aboveSuggestion = highlightedSuggestion.previousSibling;
                if (aboveSuggestion !== null) {
                    me.highlightSuggestion(aboveSuggestion);
                }
                return;
            }
            if ((event.which == 40 || event.keyCode == 40) && me.suggestions.childNodes.length > 0) {
                var highlightedSuggestion = me.suggestions.querySelector('.token-autocomplete-suggestion-highlighted');
                var belowSuggestion = highlightedSuggestion.nextSibling;
                if (belowSuggestion !== null) {
                    me.highlightSuggestion(belowSuggestion);
                }
                return;
            }
            me.hideSuggestions();
            me.clearSuggestions();
            if (me.textInput.textContent.length >= me.options.minCharactersForSuggestion) {
                var value_1 = me.textInput.textContent;
                if (Array.isArray(me.options.initialSuggestions)) {
                    me.options.initialSuggestions.forEach(function (suggestion) {
                        if (typeof suggestion === 'string' && value_1 === suggestion.slice(0, value_1.length)) {
                            me.addSuggestion(suggestion);
                        }
                    });
                    if (me.suggestions.childNodes.length > 0) {
                        me.highlightSuggestionAtPosition(0);
                    }
                }
            }
            else {
            }
        });
        this.container.tokenAutocomplete = this;
    }
    /**
     * Adds a token with the specified name to the list of currently prensent tokens displayed to the user and the hidden select.
     *
     * @param {string} tokenText - the name of the token to create
     */
    TokenAutocomplete.prototype.addToken = function (tokenText) {
        var option = document.createElement('option');
        option.text = tokenText;
        option.setAttribute('data-text', tokenText);
        this.hiddenSelect.add(option);
        var token = document.createElement('span');
        token.classList.add('token-autocomplete-token');
        token.setAttribute('data-text', tokenText);
        token.textContent = tokenText;
        var deleteToken = document.createElement('span');
        deleteToken.classList.add('token-autocomplete-token-delete');
        deleteToken.textContent = '\u00D7';
        token.appendChild(deleteToken);
        var me = this;
        deleteToken.addEventListener('click', function (event) {
            me.removeToken(token);
        });
        this.container.insertBefore(token, this.textInput);
        this.log('added token', token);
    };
    /**
     * Completely clears the currently present tokens from the field.
     */
    TokenAutocomplete.prototype.removeAllTokens = function () {
        var tokens = this.container.querySelectorAll('.token-autocomplete-token');
        var me = this;
        tokens.forEach(function (token) { me.removeToken(token); });
    };
    /**
     * Removes the last token in the list of currently present token. This is the last added token next to the input field.
     */
    TokenAutocomplete.prototype.removeLastToken = function () {
        var tokens = this.container.querySelectorAll('.token-autocomplete-token');
        var token = tokens[tokens.length - 1];
        this.removeToken(token);
    };
    /**
     * Removes the specified token from the list of currently present tokens.
     *
     * @param {Element} token - the token to remove
     */
    TokenAutocomplete.prototype.removeToken = function (token) {
        this.container.removeChild(token);
        var tokenText = token.getAttribute('data-text');
        var hiddenOption = this.hiddenSelect.querySelector('option[data-text="' + tokenText + '"]');
        hiddenOption.parentElement.removeChild(hiddenOption);
        this.log('removed token', token.textContent);
    };
    TokenAutocomplete.prototype.removeTokenWithText = function (tokenText) {
        var token = this.container.querySelector('.token-autocomplete-token[data-text="' + tokenText + '"]');
        if (token !== null) {
            this.removeToken(token);
        }
    };
    /**
     * Clears the currently present tokens and creates new ones from the given input value.
     *
     * @param {(Array\|string)} value - either the name of a single token or a list of tokens to create
     */
    TokenAutocomplete.prototype.val = function (value) {
        this.removeAllTokens();
        if (Array.isArray(value)) {
            var me_1 = this;
            value.forEach(function (token) {
                if (typeof token === 'string') {
                    me_1.addToken(token);
                }
            });
        }
        else {
            this.addToken(value);
        }
    };
    /**
     * Hides the suggestions dropdown from the user.
     */
    TokenAutocomplete.prototype.hideSuggestions = function () {
        this.suggestions.style.display = '';
    };
    /**
     * Shows the suggestions dropdown to the user.
     */
    TokenAutocomplete.prototype.showSuggestions = function () {
        this.suggestions.style.display = 'block';
    };
    TokenAutocomplete.prototype.highlightSuggestionAtPosition = function (index) {
        var suggestions = this.suggestions.querySelectorAll('li');
        suggestions.forEach(function (suggestion) {
            suggestion.classList.remove('token-autocomplete-suggestion-highlighted');
        });
        suggestions[index].classList.add('token-autocomplete-suggestion-highlighted');
    };
    TokenAutocomplete.prototype.highlightSuggestion = function (suggestion) {
        this.suggestions.querySelectorAll('li').forEach(function (suggestion) {
            suggestion.classList.remove('token-autocomplete-suggestion-highlighted');
        });
        suggestion.classList.add('token-autocomplete-suggestion-highlighted');
    };
    /**
     * Removes all previous suggestions from the dropdown.
     */
    TokenAutocomplete.prototype.clearSuggestions = function () {
        this.suggestions.innerHTML = '';
    };
    TokenAutocomplete.prototype.clearCurrentInput = function () {
        this.textInput.textContent = '';
    };
    TokenAutocomplete.prototype.debug = function (state) {
        if (state) {
            this.log = console.log.bind(window.console);
        }
        else {
            this.log = function () { };
        }
    };
    /**
     * Adds a suggestion with the given text matching the users input to the dropdown.
     *
     * @param {string} suggestionText - the text that should be displayed for the added suggestion
     */
    TokenAutocomplete.prototype.addSuggestion = function (suggestionText) {
        var option = document.createElement('li');
        option.textContent = suggestionText;
        var me = this;
        option.addEventListener('click', function (event) {
            if (this.classList.contains('token-autocomplete-suggestion-active')) {
                me.removeTokenWithText(suggestionText);
            }
            else {
                me.addToken(suggestionText);
            }
            me.clearSuggestions();
            me.hideSuggestions();
            me.clearCurrentInput();
        });
        if (this.container.querySelector('.token-autocomplete-token[data-text="' + suggestionText + '"]') !== null) {
            option.classList.add('token-autocomplete-suggestion-active');
        }
        this.suggestions.appendChild(option);
        this.showSuggestions();
        this.log('added suggestion', suggestionText);
    };
    TokenAutocomplete.prototype.mergeOptions = function (source, properties) {
        var property;
        for (property in properties) {
            if (properties.hasOwnProperty(property)) {
                source[property] = properties[property];
            }
        }
        return source;
    };
    return TokenAutocomplete;
}());