var app = app || {};

app.FoodView = Backbone.View.extend({

    tagName: 'tr',

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
        this.$el.fadeIn();

        return this;
    },

    clear: function() {
        this.$el.fadeOut();
        this.model.destroy();
    }
});
