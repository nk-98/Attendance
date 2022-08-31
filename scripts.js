//Gets current date, used in the Attendance and Leave forms.
Date.prototype.toDateInputValue = (function() {
    var local = new Date(this);
    local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
    return local.toJSON().slice(0,10);
});

const removeDash = (str) => {
    return str.replace("-", "");
}