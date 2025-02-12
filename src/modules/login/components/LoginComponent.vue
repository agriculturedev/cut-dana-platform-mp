<script>
import {mapMutations, mapGetters, mapActions} from "vuex";
import {translateKeyWithPlausibilityCheck} from "../../../shared/js/utils/translateKeyWithPlausibilityCheck.js";

export default {
    name: "LoginComponent",
    components: {
    },
    computed: {
        ...mapGetters(["isMobile"]),
        ...mapGetters("Modules/Login", ["loggedIn", "screenName", "email", "iconLogin", "iconLogged"])
    },
    mounted () {
        if (!this.isLoggedIn()) {
            this.openLoginWindow();
        }
        setInterval(() => this.isLoggedIn(), 10_000);
    },
    methods: {
        ...mapMutations("Menu", ["setCurrentComponentPropsName", "setCurrentComponentPropsDescription"]),
        ...mapMutations("Modules/Login", ["setActive", "setIcon"]),
        ...mapActions("Modules/Login", [
            "initialize",
            "logout",
            "checkLoggedIn",
            "getAuthCodeUrl"
        ]),
        translateKeyWithPlausibilityCheck,

        /**
         * Translates the given translationKey or keeps a given text as it is if no translationKey is detected.
         * @param {String} translationKey the value or key to translate, if this is not a translation key, it will return the value as it is
         * @param {Object} [options=null] the options to use for the translation, if given translationKey must be a translation key
         * @returns {String} the translation or the given param as it is
         */
        translate (translationKey, options = null) {
            if (typeof options === "object" && options !== null) {
                return i18next.t(translationKey, options);
            }
            return this.translateKeyWithPlausibilityCheck(translationKey, (v) => i18next.t(v));
        },

        getTitle () {
            return this.translate("common:modules.login.profile") || "Profile";
        },

        /**
         * Returns true if user is logged in, else false
         * @return {Boolean} logged in
         */
        isLoggedIn () {
            this.checkLoggedIn();
            this.setLoginProps();
            return this.loggedIn;
        },

        /**
         * Opens a login popup and stores retrieved login data into store
         *
         * @return {void}
         */
        async openLoginWindow () {
            let timer = null;

            const params = "width=500,height=500,status=no,location=no,menubar=no," +
                    `top=${window.screenY + (window.outerHeight - 500) / 2.5},` +
                    `left=${window.screenX + (window.outerWidth - 500) / 2}`,

                loginPopup = window.open(await this.getAuthCodeUrl(), this.translate("common:modules.login.login"), params);

            timer = setInterval(() => {
                if (loginPopup.closed) {
                    clearInterval(timer);

                    this.reloadWindow();
                }
            }, 500);
        },

        /**
         * Reload the window if possible.
         * This will show the masterportal with new rights after login or logout.
         *
         * @return {void}
         */
        reloadWindow () {
            if (window?.location) {
                window.location.reload();
            }
        },

        /**
         * Logs out the user by removing all cookies and clearing the store
         * @param {Boolean} [reload = false] if true, the window will be reloaded after logout
         *
         * @return {void}
         */
        logoutButton (reload = false) {
            this.logout();

            this.setLoginProps();

            if (reload) {
                this.reloadWindow();
            }
        },


        /**
         * Sets the icon, name and description according to the login status.
         * @return {void}
         */
        setLoginProps () {
            const iconType = this.loggedIn ? this.iconLogged : this.iconLogin,
                componentName = this.loggedIn ? "common:modules.login.logout" : "common:modules.login.login",
                componentDescription = this.loggedIn ? "common:modules.login.descriptionLoggedIn" : "common:modules.login.description";

            this.setIcon(iconType);
            this.setCurrentComponentPropsName({side: "secondaryMenu", name: componentName});
            this.setCurrentComponentPropsDescription({side: "secondaryMenu", description: componentDescription});
        }
    }
};
</script>

<template lang="html">
    <div id="login-component">
        <div
            v-show="!screenName && !email"
            class="progress-loader"
        >
            <div class="loader" />
            <span>{{ $t('common:modules.login.progress') }}</span>
        </div>
        <div v-show="screenName">
            <span>{{ translate('common:modules.login.name') }}:</span>
            <span>{{ screenName }}</span>
        </div>
        <div v-show="email">
            <span>{{ translate('common:modules.login.email') }}:</span>
            <span>{{ email }}</span>
        </div>
        <div><p>&nbsp;</p></div>
        <button
            id="logout-button"
            class="btn btn-logout"
            type="button"
            :title="translate('common:modules.login.logout')"
            @click="logoutButton(true)"
        >
            <span class="bootstrap-icon logout-icon">
                <i
                    id="logout-icon"
                    class="bi-door-closed"
                /> {{ translate('common:modules.login.logout') }}
            </span>
        </button>
    </div>
</template>

<style lang="scss" scoped>
@import "~variables";
.login-window {
  box-shadow: 0 6px 12px rgba(0, 0, 0, 0.176);
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  margin: 0;
  z-index: 2000;
}
.progress-loader {
  display: flex;
  flex-direction: row;
}
.loader {
  border: 3px solid #f3f3f3; /* Light grey */
  border-top: 3px solid #333333; /* Grey */
  border-radius: 50%;
  width: 16px;
  height: 16px;
  animation: spin 2s linear infinite;
  display: inline;
  margin-right: 10px;
}
@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}
</style>
