/**
 * The state of the login.
 * @module  modules/login/store/stateLogin
 * @property {String} [icon="bi-globe"] icon next to title (config-param)
 * @property {String} [description="common:modules.login.description"] The description that should be shown in the button in the menu.
 * @property {Boolean} [hasMouseMapInteractions=true] If this attribute is true, then all other modules will be deactivated when this attribute is also true. Only one module with this attribute true may be open at the same time, since conflicts can arise in the card interactions.
 * @property {String} [name="common:modules.login.name"] displayed as title (config-param)
 * @property {String[]} [supportedDevices=["Desktop", "Mobile", "Table"]] Devices on which the module is displayed.
 * @property {String[]} [supportedMapModes=["2D", "3D"]] Map mode in which this module can be used.
 * @property {String} [type= "login"] the type of the component *
 * @property {Boolean} active - Determines if the login is rendered or not.
 * @property {Boolean} loggedIn - Indicates if the user is logged in.
 * @property {String} [username] - The username of the logged-in user, otherwise undefined.
 * @property {String} [screenName] - The user's name displayed in the frontend if logged in, otherwise undefined.
 * @property {String} [email] - The user's email displayed in the frontend if logged in, otherwise undefined.
 * @property {String} [accessToken] - The OIDC access token if logged in, otherwise undefined.
 * @property {String} [refreshToken] - The OIDC refresh token if logged in, otherwise undefined.
 * @property {String} [iconLogin] - Icon displayed next to title if not logged in.
 * @property {String} [iconLogout] - Icon for the logout button.
 * @property {String} [iconLogged] - Icon displayed next to title if logged in.
 * @property {Boolean} [renderToWindow] - Determines if the component is rendered in a window pane instead of the sidebar.
 * @property {Boolean} [resizableWindow] - If true and if rendered to window pane, the pane is resizable.
 * @property {Boolean} [deactivateGFI] - If true, component activation deactivates the GFI (GetFeatureInfo) component.
 */
const state = {
    icon: "bi-door-open",
    description: "common:modules.login.description",
    hasMouseMapInteractions: false,
    name: "common:modules.login.login",
    supportedDevices: ["Desktop", "Mobile", "Table"],
    supportedMapModes: ["2D", "3D"],
    type: "login",

    active: false,
    loggedIn: false,
    username: undefined,
    screenName: undefined,
    email: undefined,
    accessToken: undefined,
    refreshToken: undefined,
    iconLogin: "bi-door-open",
    iconLogout: "bi-door-closed",
    iconLogged: "bi-person-circle"
};

export default state;
