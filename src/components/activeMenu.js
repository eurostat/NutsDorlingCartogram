/*
 *   This content is licensed according to the W3C Software License at
 *   https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document
 *
 *   File:   menu-button-actives-active-descendant.js
 *
 *   Desc:   Creates a menu button that opens a menu of actions using aria-activedescendants
 */
const rci2_layout = {
    infoTweetTitle: '', // Title for Twitter share
    infoMapHeader: '', // Header for the shared content
    mainLocation: document.location, // The main URL to share
    infoHeaderTweet: '#EurostatRYB #Eurostat', // Hashtags for Twitter
    shareMail: '', // Subject for the email share
    shareMailBody: '', // Body for the email share
}

class MenuButtonActionsActiveDescendant {
    constructor(domNode, performMenuAction) {
        this.domNode = domNode
        this.performMenuAction = performMenuAction
        this.buttonNode = domNode.querySelector('button')
        this.menuNode = domNode.querySelector('[role="menu"]')
        this.currentMenuitem = {}
        this.menuitemNodes = []
        this.firstMenuitem = false
        this.lastMenuitem = false
        this.firstChars = []

        this.buttonNode.addEventListener('keydown', this.onButtonKeydown.bind(this))
        this.buttonNode.addEventListener('click', this.onButtonClick.bind(this))
        this.menuNode.addEventListener('keydown', this.onMenuKeydown.bind(this))

        const nodes = domNode.querySelectorAll('[role="menuitem"]')

        for (let i = 0; i < nodes.length; i++) {
            const menuitem = nodes[i]
            this.menuitemNodes.push(menuitem)
            menuitem.tabIndex = -1
            this.firstChars.push(menuitem.textContent.trim()[0].toLowerCase())

            menuitem.addEventListener('click', this.onMenuitemClick.bind(this))
            menuitem.addEventListener('mouseover', this.onMenuitemMouseover.bind(this))

            if (!this.firstMenuitem) {
                this.firstMenuitem = menuitem
            }
            this.lastMenuitem = menuitem
        }

        domNode.addEventListener('focusin', this.onFocusin.bind(this))
        domNode.addEventListener('focusout', this.onFocusout.bind(this))

        window.addEventListener('mousedown', this.onBackgroundMousedown.bind(this), true)
    }

    setFocusToMenuitem(newMenuitem) {
        for (let i = 0; i < this.menuitemNodes.length; i++) {
            const menuitem = this.menuitemNodes[i]
            if (menuitem === newMenuitem) {
                this.currentMenuitem = newMenuitem
                menuitem.classList.add('focus')
                this.menuNode.setAttribute('aria-activedescendant', newMenuitem.id)
            } else {
                menuitem.classList.remove('focus')
            }
        }
    }

    setFocusToFirstMenuitem() {
        this.setFocusToMenuitem(this.firstMenuitem)
    }

    setFocusToLastMenuitem() {
        this.setFocusToMenuitem(this.lastMenuitem)
    }

    setFocusToPreviousMenuitem() {
        let newMenuitem, index

        if (this.currentMenuitem === this.firstMenuitem) {
            newMenuitem = this.lastMenuitem
        } else {
            index = this.menuitemNodes.indexOf(this.currentMenuitem)
            newMenuitem = this.menuitemNodes[index - 1]
        }

        this.setFocusToMenuitem(newMenuitem)
        return newMenuitem
    }

    setFocusToNextMenuitem() {
        let newMenuitem, index

        if (this.currentMenuitem === this.lastMenuitem) {
            newMenuitem = this.firstMenuitem
        } else {
            index = this.menuitemNodes.indexOf(this.currentMenuitem)
            newMenuitem = this.menuitemNodes[index + 1]
        }
        this.setFocusToMenuitem(newMenuitem)
        return newMenuitem
    }

    setFocusByFirstCharacter(char) {
        char = char.toLowerCase()
        let start = this.menuitemNodes.indexOf(this.currentMenuitem) + 1
        if (start >= this.menuitemNodes.length) {
            start = 0
        }

        let index = this.firstChars.indexOf(char, start)

        if (index === -1) {
            index = this.firstChars.indexOf(char, 0)
        }

        if (index > -1) {
            this.setFocusToMenuitem(this.menuitemNodes[index])
        }
    }

    openPopup() {
        this.menuNode.style.display = 'block'
        this.menuNode.style.setProperty('display', 'block', 'important')
        this.buttonNode.setAttribute('aria-expanded', 'true')
        this.menuNode.focus()
    }

    closePopup() {
        if (this.isOpen()) {
            this.buttonNode.removeAttribute('aria-expanded')
            this.menuNode.setAttribute('aria-activedescendant', '')
            for (let i = 0; i < this.menuitemNodes.length; i++) {
                this.menuitemNodes[i].classList.remove('focus')
            }
            this.menuNode.style.display = 'none'
            this.buttonNode.focus()
        }
    }

    isOpen() {
        return this.buttonNode.getAttribute('aria-expanded') === 'true'
    }

    onFocusin() {
        this.domNode.classList.add('focus')
    }

    onFocusout() {
        this.domNode.classList.remove('focus')
    }

    onButtonKeydown(event) {
        let key = event.key
        let flag = false

        switch (key) {
            case ' ':
            case 'Enter':
            case 'ArrowDown':
            case 'Down':
                this.openPopup()
                this.setFocusToFirstMenuitem()
                flag = true
                break

            case 'Esc':
            case 'Escape':
                this.closePopup()
                flag = true
                break

            case 'Up':
            case 'ArrowUp':
                this.openPopup()
                this.setFocusToLastMenuitem()
                flag = true
                break

            default:
                break
        }

        if (flag) {
            event.stopPropagation()
            event.preventDefault()
        }
    }

    onButtonClick(event) {
        if (this.isOpen()) {
            this.closePopup()
        } else {
            this.openPopup()
        }
        event.stopPropagation() // Stops the event from bubbling up
        event.preventDefault() // Prevents the default button click behavior
    }

    onMenuKeydown(event) {
        let key = event.key
        let flag = false

        function isPrintableCharacter(str) {
            return str.length === 1 && str.match(/\S/)
        }

        if (event.ctrlKey || event.altKey || event.metaKey) {
            return
        }

        if (event.shiftKey) {
            if (isPrintableCharacter(key)) {
                this.setFocusByFirstCharacter(key)
                flag = true
            }

            if (key === 'Tab') {
                this.closePopup()
                flag = true
            }
        } else {
            switch (key) {
                case ' ':
                case 'Enter':
                    this.closePopup()
                    this.performMenuAction(this.currentMenuitem)
                    flag = true
                    break

                case 'Esc':
                case 'Escape':
                    this.closePopup()
                    flag = true
                    break

                case 'Up':
                case 'ArrowUp':
                    this.setFocusToPreviousMenuitem()
                    flag = true
                    break

                case 'ArrowDown':
                case 'Down':
                    this.setFocusToNextMenuitem()
                    flag = true
                    break

                case 'Home':
                case 'PageUp':
                    this.setFocusToFirstMenuitem()
                    flag = true
                    break

                case 'End':
                case 'PageDown':
                    this.setFocusToLastMenuitem()
                    flag = true
                    break

                case 'Tab':
                    this.closePopup()
                    break

                default:
                    if (isPrintableCharacter(key)) {
                        this.setFocusByFirstCharacter(key)
                        flag = true
                    }
                    break
            }
        }

        if (flag) {
            event.stopPropagation()
            event.preventDefault()
        }
    }

    onMenuitemMouseover(event) {
        const tgt = event.currentTarget
        this.setFocusToMenuitem(tgt)
    }

    onMenuitemClick(event) {
        const tgt = event.currentTarget
        this.closePopup()
        this.performMenuAction(tgt)
    }

    onBackgroundMousedown(event) {
        if (!this.domNode.contains(event.target)) {
            if (this.isOpen()) {
                this.closePopup()
            }
        }
    }
}

const menuButtonActionsActiveDescendant = MenuButtonActionsActiveDescendant
window.MenuButtonActionsActiveDescendant = menuButtonActionsActiveDescendant

function buildShareMenu() {
    const menuButtons = document.querySelectorAll('.menu-button-actions')
    for (let i = 0; i < menuButtons.length; i++) {
        new MenuButtonActionsActiveDescendant(menuButtons[i], performMenuAction)
    }
}

function buildLinkURL() {
    const curLink = location.href.split('?')[0]
    return curLink
}

function performMenuAction(menuButton) {
    const currentShareUrl = buildLinkURL()
    switch (menuButton.id) {
        case 'facebookMenuItem':
            openFacebookShare(currentShareUrl)
            break
        case 'twitterMenuItem':
            openTwitterShare(rci2_layout)
            break
        case 'linkedinMenuItem':
            openLinkedInShare(currentShareUrl)
            break
        case 'emailMenuItem':
            openMailShare(currentShareUrl)
            break
        default:
            break
    }
}

function openTwitterShare(rci2_layout) {
    const twitterURL =
        'https://x.com/intent/tweet?text=' +
        encodeURIComponent(rci2_layout.infoTweetTitle + rci2_layout.infoMapHeader) +
        '%20%20' +
        encodeURIComponent(rci2_layout.mainLocation) +
        '%20' +
        encodeURIComponent(rci2_layout.infoHeaderTweet) +
        '&tw_p=tweetbutton&_blank'
    window.open(twitterURL)
}

function openLinkedInShare(shareLink) {
    const linkedInURL = 'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(shareLink)
    window.open(linkedInURL)
}

function openFacebookShare(shareLink) {
    window.open('https://www.facebook.com/sharer/sharer.php?&u=' + encodeURIComponent(shareLink), '', '')
}

function openMailShare(shareLink) {
    const subject = encodeURIComponent(rci2_layout.shareMail)
    const emailBody = encodeURIComponent(rci2_layout.shareMailBody + rci2_layout.mainLocation + '\n\n')
    const mailtoLink = 'mailto:?subject=' + subject + '&body=' + emailBody
    window.open(mailtoLink)
}

// Copy button function using vanilla JavaScript
function copyText() {
    const text = document.getElementById('share_embed').innerText
    navigator.clipboard
        .writeText(text)
        .then(() => {
            document.getElementById('copy-success').classList.add('success')
        })
        .catch((err) => {
            console.error('Failed to copy text: ', err)
        })
}

if (!window.hasBuiltShareMenu) {
    document.addEventListener('DOMContentLoaded', function () {
        console.log('build')
        buildShareMenu()
    })
    window.hasBuiltShareMenu = true
}
