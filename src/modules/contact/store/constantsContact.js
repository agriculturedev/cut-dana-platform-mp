const minMessageLength = 10,
    regexMail = /^.+@.+\..+$/,
    regexPhone = /^[+]*[(]{0,1}[0-9]{1,4}[)]{0,1}[-\s./0-9]*$/,
    regexUsername = /.+/;
    // more restrictive, but test cases don't work:
    // /^[A-Za-z\xC0-\xFF][A-Za-z\xC0-\xFF'-]*([ A-Za-z\xC0-\xFF][A-Za-z\xC0-\xFF'.-]+)*$/u;

export {
    minMessageLength,
    regexMail,
    regexPhone,
    regexUsername
};
