var app = app || {};

app.FoodView = Backbone.View.extend({

    tagName: 'tr',
    className: 'food-item',

    template: _.template($('#food-template').html()),

    events: {
        'click .destroy': 'clear'
    },

    initialize: function() {
        this.listenTo(this.model, 'change', this.render);
        this.listenTo(this.model, 'destroy', this.remove);
    },

    render: function() {
        this.$el.html(this.template(this.model.attributes));

        return this;
    },

    clear: function() {
        console.log("I'm here");
        // this.$el.slideToggle('slow');
        this.model.destroy();
    }
});
