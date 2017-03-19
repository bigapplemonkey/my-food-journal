var app = app || {};

var Journal = Backbone.Model.extend({

    defaults: {
        date: ''
    },

    initialize: function() {
        this.set('meals', new app.Meals());
        this.get('meals').on('add remove', this.updateMetrics, this);
        this.set({
            calories: 0,
            carbs: 0,
            protein: 0,
            fat: 0
        }, { silent: true });
        // this.get('meals').add(new app.Meal({ name: 'Meal 1' }));
    },

    updateMetrics: function() {
        console.log('jorge');
        this.set({
            calories: this.get('meals').nutrition('calories'),
            carbs: this.get('meals').nutrition('carbs'),
            protein: this.get('meals').nutrition('protein'),
            fat: this.get('meals').nutrition('fat')
        }, { silent: true });
    }
});

app.Journal = new Journal({ date: 'test' });
