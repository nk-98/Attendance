
//Gets current date, used in the Attendance and Leave forms.
Date.prototype.toDateInputValue = (function() {
    var local = new Date(this);
    local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
    return local.toJSON().slice(0,10);
});


module.exports = {

dateFix: (str) => {
    const newStr = str.replaceAll("-", "");
    return parseInt(newStr);
},




}