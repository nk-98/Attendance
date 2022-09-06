
//Gets current date, used in the Attendance and Leave forms.
Date.prototype.toDateInputValue = (function() {
    const local = new Date(this);
    local.setMinutes(this.getMinutes() - this.getTimezoneOffset());
    return local.toJSON().slice(0,10);
});

/*<script>window.onload = () => {
    document.getElementById("download").addEventListener("click", () => {
        const container = this.document.getElementById("controlContainer");
        html2pdf().from(container).save();
    })}</script>*/