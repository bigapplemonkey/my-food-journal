// js/app.js

var app = app || {};
var ENTER_KEY = 13;

$(function() {
    // Kick things off by creating the **App**.
    new app.JournalView({ model: app.Journal });
    // app.Journal.get('meals').add({ name: 'Meal 1' });

});
