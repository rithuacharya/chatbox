(function () {

    const chatboxTemplate = document.querySelector('#chatbox'),
        // button to add chat box
        addChatBox = document.querySelector('.add_chatbox'),
        chatBoxContainer = document.querySelector('.chatboxes_container'),
        alertBox = document.querySelector('.alertbox'),

        // array containing chatbox id's
        _chatBox = [];

    // array containing selected messages
    let _selected = [],

        // object containing current message detail
        _message,

        // reference id for selected messages
        _reference_id;

    // remove the animation class after the animation ends
    alertBox.addEventListener('animationend', () => {
        alertBox.classList.remove('alertbox--active');
    });

    function genRandomNo() {
        return (Math.random() * 10000).toFixed();
    }

    function showSuccess(text) {
        alertBox.querySelector('.alertbox__text').textContent = text;
        alertBox.classList.add('alertbox--active');
        // class alertbox--active is removed in animationend event listener
    }

    function getChatbox(ele) {
        let parent = ele.parentElement;
        while (!parent.getAttribute('chatboxid')) {
            parent = parent.parentElement;
        }
        return parent;
    }

    function Chatbox(uniqueId) {
        this.id = uniqueId;
    }

    Chatbox.prototype.templateGenerator = function () {
        let clone, chatbox, msg_container, inputText, sendBtn, deleteBtn, chatboxid = this.id;

        clone = document.importNode(chatboxTemplate.content, true);

        // set attribute chatboxid to uniquely generated id
        chatbox = clone.querySelector('.chatbox-wrapper[chatboxid]');
        chatbox.setAttribute('chatboxid', chatboxid);

        // add chatbox id to the array
        _chatBox.push(chatboxid);

        msg_container = clone.querySelector(".chatbox__msg-container");

        inputText = clone.querySelector('.chatbox__input');

        sendBtn = clone.querySelector('.chatbox__send-btn');

        deleteBtn = clone.querySelector('.chatbox__delete-btn');

        this.bindEvents({ chatbox, msg_container, inputText, sendBtn, deleteBtn, chatboxid });

        clone.querySelector('.chatbox__heading-id').textContent = "ChatBox " + chatboxid;
        chatBoxContainer.appendChild(clone);
    }

    // function that bind events to the elements
    Chatbox.prototype.bindEvents = function (obj) {
        let { chatbox, msg_container, inputText, sendBtn, chatboxid, deleteBtn } = obj;

        // adding custom messagechange event for chatbox
        chatbox.addEventListener('messagechange', e => {
            this.displayNewlyAddedMsg(e.target);
        });

        // adding click and blur events for input
        inputText.addEventListener('keyup', e => {
            if (!inputText.value) {
                setInvalid(inputText);
            } else if (e.keyCode === 13) {
                this.sendMessage(e, inputText, chatboxid);
            } else if (inputText.classList.contains('chatbox__input--invalid')) {
                setValid(inputText);
            }
        });
        inputText.addEventListener('blur', e => {
            if (inputText.classList.contains('chatbox__input--invalid')) {
                setValid(inputText);
            }
        });

        // adding click and blur events for sendBtn
        sendBtn.addEventListener('click', e => {
            if (!inputText.value) {
                setInvalid(inputText);
            } else {
                this.sendMessage(e, inputText, chatboxid);
            }
        });
        sendBtn.addEventListener('blur', function () {
            if (inputText.classList.contains('chatbox__input--invalid')) {
                setValid(inputText);
            }
        });

        // adding click event for deleteBtn
        deleteBtn.addEventListener('click', e => {
            let chatbox = document.querySelector("[chatboxid='" + _reference_id + "'"),
                parent = chatbox.querySelector('.chatbox__msg-container');

            _selected.forEach(ele => {
                parent.removeChild(ele);
            });
            showSuccess("Selected " + (_selected.length === 1 ? "Message" : "Messages") + " deleted");
            _selected = [];
            e.currentTarget.style.display = "none";
        });

        // adding click event to msg_container for selecting messages to be deleted
        msg_container.addEventListener('click', e => {
            let element = e.target,
                target, self, chatbox, deleteBtn;

            if (element.classList.contains("chatbox__msg-self")) {
                self = true;
                target = element;
            } else if (element.classList.contains("chatbox__msg-others")) {
                self = false;
                target = element;
            } else if (element.parentElement.classList.contains("chatbox__msg-self")) {
                self = true;
                target = element.parentElement;

            } else if (element.parentElement.classList.contains("chatbox__msg-others")) {
                self = false;
                target = element.parentElement;
            } else {
                return;
            }

            if (e.ctrlKey) {
                chatbox = getChatbox(target);
                deleteBtn = chatbox.querySelector('.chatbox__delete-btn');

                if (!_selected.length) {
                    _reference_id = chatbox.getAttribute('chatboxid');
                }

                if (_reference_id === chatbox.getAttribute('chatboxid')) {
                    if (!target.getAttribute('selected')) {
                        _selected.push(target);
                        deleteBtn.style.display = "inline-block";
                        target.setAttribute('selected', true);
                        if (self) {
                            target.classList.add('chatbox__msg-self--selected');
                        } else {
                            target.classList.add('chatbox__msg-others--selected');
                        }
                    } else {
                        _selected = _selected.filter(ele => target !== ele);
                        if (!_selected.length) {
                            deleteBtn.style.display = "none";
                        }
                        target.removeAttribute('selected');
                        if (self) {
                            target.classList.remove('chatbox__msg-self--selected');
                        } else {
                            target.classList.remove('chatbox__msg-others--selected');
                        }
                    }
                }
            }

        });

        function setInvalid(inputText) {
            inputText.classList.add('chatbox__input--invalid');
            inputText.setAttribute('placeholder', "Message cannot be empty");
        }

        function setValid(inputText) {
            inputText.classList.remove('chatbox__input--invalid');
            inputText.setAttribute('placeholder', "Type a message");
        }
    }

    Chatbox.prototype.sendMessage = function (e, inputText, chatboxid) {
        _message = {
            by: chatboxid,
            text: inputText.value
        }
        inputText.value = "";
        this.updateAll();
    }

    Chatbox.prototype.displayNewlyAddedMsg = function (element) {
        const msg_container = element.querySelector(".chatbox__msg-container");

        if (this.id === _message.by) {
            msg_container.innerHTML += `
                <div class="chatbox__msg-self">
                    <div class="text">${_message.text}</div>
                </div>
            `;
        } else {
            msg_container.innerHTML += `
                <div class="chatbox__msg-others">
                    <div style="font-size: 12px;">${_message.by}</div>
                    <div class="text">${_message.text}</div>
                </div>
            `;
        }

        // set scrollbar position to the bottom
        msg_container.scrollTo(0, msg_container.scrollHeight);
    }

    // dispatches custom event
    Chatbox.prototype.updateAll = function () {
        let chatboxes = document.querySelectorAll("[chatboxid]");
        for (let i = 0; i < chatboxes.length; i++) {
            chatboxes[i].dispatchEvent(msgEvent);
        }
        showSuccess("Message sent successfully");
    }

    Chatbox.prototype.init = function () {
        this.templateGenerator();
    }

    addChatBox.addEventListener('click', function () {
        let obj;
        obj = new Chatbox(genRandomNo());
        obj.init();
    });

    const msgEvent = new CustomEvent('messagechange');

})();
