var app = app || {};

var Journal = Backbone.Model.extend({

    defaults: {
        date: '',
        meals: null,
        calories: 0,
        carbs: 0,
        protein: 0,
        fat: 0
    },

    initialize: function() {
        this.set('meals', new app.Meals());
        this.get('meals').on('add remove', this.updateMetrics, this);
    },

    updateMetrics: function() {
        this.set({
            calories: this.get('meals').nutrition('calories'),
            carbs: this.get('meals').nutrition('carbs'),
            protein: this.get('meals').nutrition('protein'),
            fat: this.get('meals').nutrition('fat')
        }, { silent: true });
    },

    getMacros: function() {
        var total = this.get('carbs') + this.get('protein') + this.get('fat');
        var macrosPercenteges = [];

        var model = this;
        _.each(['carbs', 'protein', 'fat'], function(macro) {
            macrosPercenteges.push(Math.round((model.get(macro) / total) * 100));
        });
        return macrosPercenteges;
    }
});
