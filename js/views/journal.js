var app = app || {};

app.JournalView = Backbone.View.extend({

    el: '#journal-container',

    template: _.template($('#metrics-template').html()),

    events: {
        'click #addMeal': 'showAddMealModal'
    },

    initialize: function() {
        //View's model
        this.journal = this.model;

        //Caching selectors
        this.$mealsContainer = this.$('.meals-container');
        this.$metricsContainer = this.$('.statistics');
        this.$modalHeader = this.$('.modal-header');
        this.$modalAddButton = this.$('#addButton');
        this.$modalSearch = this.$('.search-container');
        this.$modalNameContainer = this.$('.name-container');
        this.$modal = $('.ui.basic.modal');
        this.$modalInput = $('.name-input');

        //Listening some events
        this.listenTo(this.journal.get('meals'), 'add', this.addOneMeal);
        this.listenTo(this.journal.get('meals'), 'remove', this.removeOneMeal);
        Backbone.on('ingredientsUpdate', this.render, this);

        //Semantic-UI Elements' inizializations
        this.$('.ui.accordion')
            .accordion({
                exclusive: false
            });

        //Attaching meals if any
        var view = this;
        _.each(this.journal.get('meals').models, function(meal) {
            view.$mealsContainer.append(new app.MealView({ model: meal }).render().el);
        });

        //Updating metris and charts
        this.$metricsContainer.html(this.template(this.journal.attributes));
        this.updateDonutChart();

        //Show view
        this.$el.fadeIn('slow');
    },

    render: function() {
        this.journal.updateMetrics();

        var view = this;
        //Updating metris and charts
        this.$metricsContainer.fadeOut('fast', function() {
            view.$metricsContainer.html(view.template(view.journal.attributes));
            view.$metricsContainer.fadeIn('fast');
        });
        this.updateDonutChart();

        return this;
    },

    addOneMeal: function(meal) {
        var mealView = new app.MealView({ model: meal });
        this.$mealsContainer.append(mealView.render().el);
    },

    removeOneMeal: function(meal) {
        meal.trigger('destroy', meal);
        if (meal.get('ingredients').length > 0) this.render();
    },

    updateDonutChart: function() {
        var total = this.journal.get('carbs') + this.journal.get('protein') + this.journal.get('fat');
        var macrosPercenteges = [];
        var view = this;

        _.each(['carbs', 'protein', 'fat'], function(macro) {
            macrosPercenteges.push(Math.round((view.journal.get(macro) / total) * 100));
        });
        myDonut.data.datasets[0].data = macrosPercenteges;
        myDonut.update();
    },

    showAddMealModal: function() {
        this.$modalHeader.text('Please enter a name for your meal');
        this.$modalAddButton.html('<i class="checkmark icon"></i>Add');
        this.$modalSearch.hide();
        this.$modalNameContainer.show();

        var view = this;
        this.$modal.modal({
                onHide: function() {
                    console.log('Hidden');
                },
                onApprove: function() {
                    var name = view.$modalInput.val();
                    view.journal.get('meals').add({ name: name });
                }
            })
            .modal('show');
    },

    //TODO: Move this to sepate PDF generator file
    pdfGenerator: function(userName) {
        var doc = new jsPDF()

        doc.setFontSize(12);
        doc.setFontStyle('bold');
        doc.setLineWidth(0.3);

        var dataUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAARIAAABPCAYAAAAnUEq+AAAYKmlDQ1BJQ0MgUHJvZmlsZQAAWIWVWQc8Vu37v885z7Iee++9svfee+9V9t4emwZCRhFKQhSVpCJlZqUo8QpFpWUkkUpDKeR/UL3v7/f7j8///nzOOV/Xfd3X/b3u616XBwB2Fq/IyFCYBoCw8BiSrZEuj7OLKw9+GkCAHVAAVkD08omO1LG2Ngdo+f391/J1AtVGywOJLVv/Wf+/Flpfv2gfACBrFHv7RvuEofg6ABg2n0hSDADYEVTOHx8TuYW/oJiBhBIEAEfYwgE7mGMLe+9g6W0de1s9FOsDQKD08iIFAEDcss8T5xOA2iFGonV04b5B4ahqOoo1fQK9fAFgu43q7AoLi9jCyygW8f6HnYB/sen9x6aXV8AfvOPLdiHoB0VHhnol/j+H4/8uYaGxv/vgQx/KQJKx7ZbP6LhdCIkw28KUKO4I97a0QjEdiu8G+W7rb+HJwFhjh1/6Sz7ReuiYASYAYODrpW+GYnQsYabYEAedX1jWi7TdFtWHLYNiTOx/YW9ShO0v+3BceKil+S87WYF+Jr9xhV+0gd1vHf8gQxMUozMNvp4UaO+0wxO+HRfkaIliIopHokPszH61fZEUqGf5W4cUa7vFWQDFX/xJhrY7OghLWPRvvxBJH6/tvlhQrB0TaG+80xZx9ot2Nv/NwddP32CHA+LrF+7wixuCzi5d219tMyNDrX/pIxV+oUa2O+OMNETH2f1uOxaDTrCdcUBmgr1MrXf4I18jY6ztd7hhMMAc6AF9wANi0ccbRIBgEDS81LKE/rVTYwi8AAkEAD8g8Uvyu4XTdk04+rYDSeAdivxA9J92utu1fiAOlW/8ke68JYD/dm3cdosQ8BrFYRg2jCZGDWOOvrXRRxajjFH53Y6H+nevOAOcPs4YZ4gT/cPDB2Udij4kEPTfyMzQrx/q3RaX8N8+/G0P+xo7ip3BjmOnsE+AI3i1beWXlkdQGunfmPMACzCFWjP85Z03anPhtw5GCGWtgNHFaKD8Ue4YJgwbkMDIo57oYLRQ3xRQ6T8Zxv7h9vdY/nt/W6z/6c8vOVGMqPCLhfefyOj90fp3K3r/GCNf9Gv275pIFnINuYPcRAaQDqQF8CDdSCsyhHRu4T8z4dX2TPjdm+02txDUTtBvHek66QXp9f/o3esXA9J2vEGMX0LM1oLQi4hMJAUFBMbw6KA7sh+PSbiP5C4eWWkZJQC29ved7eOz7fa+DTHd/1sWIQOAytZ+fPBvmed7AFqC0S2N7m+ZUAsA1LIADJzwiSXF7cgwWy8sIAfU6MpgBVyAH4igPskCRaAGtIEBMAVWwB64AHd01ANBGMo6HuwFqSAT5IKj4DgoBZWgGlwAl0EjaAEd4CboB4NgBIyDp+jcmANvwTL4CtYgCMJDVBA9xApxQ4KQOCQLKUOakAFkDtlCLpAnFACFQ7HQXugglAsVQqXQGagWugq1QTehAWgUegJNQwvQJ+gHjMCUMAPMCQvBUrAyrAObwfbwHjgAjoKT4HQ4Dy6Bq+BLcDN8Ex6Ex+Ep+C28ggCEAmFCeBEJRBnRQ6wQV8QfISH7kRykGKlCriDtaKwfIFPIEvIdg8PQY3gwEuj8NMY4YHwwUZj9mMOYUswFTDPmNuYBZhqzjPmJpcJyYMWxqlgTrDM2ABuPzcQWY89jm7B96NqZw37F4XBMOGGcEro2XXDBuGTcYdwpXD2uBzeKm8Wt4PF4Vrw4XgNvhffCx+Az8Sfxl/Dd+DH8HH6VQEHgJsgSDAmuhHBCGqGYcJHQRRgjzBPWyGjIBMlUyazIfMkSyfLJzpK1k90nmyNbI6clFybXILcnDyZPJS8hv0LeR/6M/DMFBQUfhQqFDUUQRQpFCUUDxV2KaYrvlHSUYpR6lLspYynzKGsoeyifUH6moqISotKmcqWKocqjqqW6RfWCapVIT5QkmhB9iQeIZcRm4hjxPTUZtSC1DrU7dRJ1MfU16vvUSzRkNEI0ejReNPtpymjaaB7RrNDS08rQWtGG0R6mvUg7QPuGDk8nRGdA50uXTldNd4tulh6h56fXo/ehP0h/lr6Pfo4BxyDMYMIQzJDLcJlhmGGZkY5RntGRMYGxjLGTcYoJYRJiMmEKZcpnamSaYPrBzMmsw+zHnM18hXmM+RsLO4s2ix9LDks9yzjLD1YeVgPWENYC1hbW52wYNjE2G7Z4tgq2PrYldgZ2NXYf9hz2RvZJDphDjMOWI5mjmmOIY4WTi9OIM5LzJOctziUuJi5trmCuY1xdXAvc9Nya3EHcx7i7uRd5GHl0eEJ5Snhu8yzzcvAa88bynuEd5l3jE+Zz4Evjq+d7zk/Or8zvz3+Mv5d/WYBbwEJgr0CdwKQgmaCyYKDgCcE7gt+EhIWchA4JtQi9EWYRNhFOEq4TfiZCJaIlEiVSJfJQFCeqLBoiekp0RAwWUxALFCsTuy8OiyuKB4mfEh/dhd2lsit8V9WuRxKUEjoScRJ1EtOSTJLmkmmSLZLvpQSkXKUKpO5I/ZRWkA6VPiv9VIZOxlQmTaZd5pOsmKyPbJnsQzkqOUO5A3Ktch/lxeX95CvkHyvQK1goHFLoVdhQVFIkKV5RXFASUPJUKld6pMygbK18WPmuClZFV+WASofKd1VF1RjVRtUPahJqIWoX1d6oC6v7qZ9Vn9Xg0/DSOKMxpcmj6al5WnNKi1fLS6tKa0abX9tX+7z2vI6oTrDOJZ33utK6JN0m3W96qnr79Hr0EX0j/Rz9YQM6AweDUoMXhnyGAYZ1hstGCkbJRj3GWGMz4wLjRyacJj4mtSbLpkqm+0xvm1Ga2ZmVms2Yi5mTzNstYAtTiyKLZ5aCluGWLVbAysSqyOq5tbB1lPUNG5yNtU2ZzWtbGdu9tnfs6O087C7afbXXtc+3f+og4hDr0OtI7bjbsdbxm5O+U6HTlLOU8z7nQRc2lyCXVle8q6PredcVNwO3425zuxV2Z+6e2CO8J2HPgDube6h7pwe1h5fHNU+sp5PnRc91LyuvKq8VbxPvcu9lHz2fEz5vfbV9j/ku+Gn4FfrN+2v4F/q/CdAIKApYCNQKLA5cCtILKg36GGwcXBn8LcQqpCZkM9QptD6MEOYZ1hZOFx4SfjuCKyIhYjRSPDIzcipKNep41DLJjHQ+GoreE90aw4BedYZiRWIzYqfjNOPK4lbjHeOvJdAmhCcMJYolZifOJxkmnUvGJPsk9+7l3Zu6d3qfzr4z+6H93vt7D/AfSD8wl2KUciGVPDUk9a806bTCtC8HnQ62p3Omp6TPZhhl1GUSM0mZjw6pHarMwmQFZQ1ny2WfzP6Z45tzL1c6tzh3/bDP4XtHZI6UHNnM888bzlfMrziKOxp+dKJAq+BCIW1hUuFskUVR8zGeYznHvhz3OD5QLF9ceYL8ROyJqRLzktaTAiePnlwvDSwdL9Mtqy/nKM8u/3bK99RYhXbFlUrOytzKH6eDTj8+Y3SmuUqoqrgaVx1X/fqs49k755TP1Z5nO597fqMmvGbqgu2F27VKtbUXOS7m18F1sXULl3ZfGrmsf7n1isSVM/VM9bkNoCG2YfGq59WJRrPG3mvK165cF7xe3kTflNMMNSc2L7cEtky1urSOtpm29bartTfdkLxR08HbUdbJ2JnfRd6V3rXZndS90hPZs3Qz4OZsr0fv01vOtx7etrk93GfWd7ffsP/WHZ073Xc17nYMqA603VO+1zKoONg8pDDU9JfCX03DisPN95Xut46ojLSPqo92jWmN3Xyg/6D/ocnDwXHL8dEJh4nHj3Y/mnrs+/jNk9AnHyfjJteepjzDPst5TvO8+AXHi6qXoi/rpxSnOqf1p4dm7GaezvrMvn0V/Wp9Lv011eviee752jeybzoWDBdGFt0W595Gvl1bynxH+678vcj76x+0PwwtOy/PfSR93Px0+DPr55ov8l96V6xXXnwN+7r2LWeVdfXCd+Xvd344/Zhfi1/Hr5dsiG60/zT7+WwzbHMz0ovktX0VQNAH9vcH4FMNAFQuANCjeRw5cSf/+lUQaCvtAACP3hRM0RvALCSGnts9MCscA08iJsgtjBHmITYMR4vrxe8laJLhyZ6Tt1GUU+ZT1RCf0dDQmtFl0w8w0jLtZr7EimHzYu/k5OE6zL3K68s3KWApOCAsJZIn+lbcZFelxFcpPekjMiNyVPK6CtGK5Uo9ylMqG2rM6uIaKpoGWrbaPjrRuul6J/TrDLoNHxgtGG+aMprtMtezcLMMsoqzzrAptK20q7NvQVf9oNOY8xOXl66zbm92v9vzxv2Zx7Bnt1e9d4XPEd8kP39/mwC1QIEgYtDX4Jch/aG1YUfCIyPsIpWi2KLWSS+ie2KqYzPi/ONNEsQTyRMXk4aSG/aW7EvfH38gKoWUmpSWc/BMemfGy0NkWerZkTnVuRNHyPPU88OOVhQMF24c23XcrTjnRHPJVClFmUK5x6nsisbKp2cwVRLVjmcPnLtwfrRmtZbnonnd3kuNlz/WqzbkX/1wze36/Warlodt6u0xN2o7nnVRdMv1ON6M6s24VXC7uK+4v+BO1t2DA4fuHRk8MpTxV8yw033J+2sjPaPJY4pjXx88etg2Xjqx75HHY90ngpNkk++ejj5rel76Yt9Lzyn9adEZmpnvs69fTcwNvL45f+NN20Lb4rm3eUtx79zfG3wQX6ZZXvk4+anr85kvGSuBX82+Sa3Sr377/uxHz1rVevqG30/9Tb7NTTT+OMCG3g4TQB96ozOHjkIvYTn07vUZ8UAm0FvTc2wkjohrwfsR2AiTZOXkARS6lBpU9sRA6hSa07Q36RYYGBn1mRKZ61k+sEmykzg6uCi4HXku8m7y6wikCnYLrYsoiQaLnRIf3PVJklFKTtpYxk02QC5KPlFhn2KSUrCym4q5qoaatDqfBqMmQfOH1jvtaZ1x3Xt6XfrXDGoMS4yyjONNAk1dzIzNlS2ELRmtMFZfrGdsRm177BrsKxyyHKOd3J1NXORcOd1wbu/Rnb7TvdojxzPCy95b3ofSZ8a3zS/f3z9APZA28HXQjeCCEL9Q1TDqsNnwloisSJcocXReDEefjiHF6sUxxs3HtyUcTnRPkk6Gkx/trd+Xuz/sgEOKfqpqmspBjXTjDOfM8EOHss5l38qZzv15hCNPJd/xaHTB0cJLRQPHXhfDJzhKFE/alIaV5ZZfOjVS8fU03xnrqoPVbWc/npesibpwvfZbncqlvZe76kGDztWDjX3XsU1GzVktd9rw7QY30jo6O790C/XY3Uzurbh14/Z430L/t7uYAfp7vINSQxp/mQ+73g8ciR/NHDv+oOph/XjHxMCjicdzT748RZ4xPBd8ofzSfCpgunpm4ZXwnOvrzPmLb+4sTC+uLhHfCb7X+uC2nPJx5LPcl6KVz99sV6//YFnLWF/9Gb8dfwygBWLAEqSAHvRerwrFQC0wDFvAp+E1xB25h1HHNGOVsb04a9wsPpnATrhDdoTch0Kdkp3yJ9UMcZC6ieYcbQldHn0WQwZjJlMucxFLJWsdWyt7J0cnZxdXN3cXzw3eJr46/lMCuYKxQruFtUX4RIHoU7EW8dxdjhI8EouSTVIp0mYyTDLTsnVysfJaCmQKDxRPKQUqyyuvqnSpZqiZqdOpT2pUaQZryWqta/frFOju0RPT+6Z/yyDf0M1I2OiTcZdJjqmjGa/ZW/NmixRLcysmq2nrOptoWzU72O6efaGDqyOP47zTFedYFzVX2HXALX+33R6mPU/cyzz2eHJ6Pvc65b3Hh8Nn0rfEz9Gf3v9+QG6gQRBA50tciEzIUmhNmHc4R/ijiKJIyyhC1E1SUrRc9FLMuVj3OOa4+/GHErQSVhMbkoKSeZKf7D22z34/6/65A60px1IT0/wP7k53yXDL9DsUm5WRXZxzPrf5cP+R8by5/C8FSCF9Ed8x6eOqxXonTEtsTrqUepdFlB84VVRxqXLw9IcqwerEsyPnhWv2X5i4KFGXfunpFZn6rIYXjYrXcq+/bJZrOdT6rF3uRk7HTJd6d0nP1177W019wv1n70oM9A2G/CUwvDRyZ+zqw9qJhsc3J58/By+lp2teZc7nLLa8p/6YtcKy2rTutBX/nf/DbRWcIgDnZgFwPAOAjRsANeIACJYBQGQAwJoKAHsVAOvmA+jJSQAZXflzflABYTSD9geH0MxxALyFiJAM5AAlQaegDugptI7md1qwN5wJX4Tvw18QdkQHCUSOIm3IDIYCo4DxRDOyVswrLB1WCxuOPYMdx5HjdHAJuEbcEl4EH4CvwS8QJAmxhG4yCjJXskvkELkzeSMFkSKcYoxSmfI0FYGKRPWCaEpsoxahLqWhokml+UYbgeYrPnQv6b3p5xnCGL4ypjIRmU4xSzHfYnFjWWEtYJNhe8Aez8HJMcJ5iEuXG3Df5MngteBj5XvDf0OgQDBYyFBYUIRSZEV0RmxM/Paudolrkg1S9dKNMq2yPXKD8i8UPiphlBlV+FUl1GTUpTXENHm06LRh7Q86T3W79ar0swwiDJ2NdI2lTLhMqc0Qs1XzZYtFyzmrGetpm1e2b+0+2284kjkxOwu7qLhauPnsTt5z3L0BPcfeeRN95Hxd/A74Vwf0Bc4GbYTQhfKGiYVLRkhEikbxkZiiyaJ/xCzEscVbJKQndif93Guwr2j/2xSL1BsH5dPbMk0OzWYfyuU9fCVPO3+qoKDI+bjGCZOT8WV9FeyniVVw9fdzn2re1y7VLV3+UL9ydeM6oZm9Vapdv8OlK6gnrnf/7ZT+fXfj7oUOeQ7njrSOLY7zPtrzpPLp6xcyU6kz43Pi81kL80tG7y9+pPmcvPJu1f/H/Ebk9v5BDSSBDYgFpaAbvIIoIFnIDUpHM/5B6AOa3avCnnAW3AA/QRA0Z3dBMpCryEsMFbqrhGDKMH+h+bcM1hdbjsadGmeOy8bdxZPjLfCF+EmCIIFE6CVjIgsl6yfnJ08jn6MwpWinFKespGKkOkzEEdOoAXUqDUKTRUukPUHHR1dPr00/zhDGiGOsYtJhmmHOZJFgmWBNZZNmm2Iv4jDmxHD2ch3kNuSh5JngreKL5jcU4BJYFZwQahE+LXJCtEAsTzxvV6FEqeR5qSbpuzIvZL/JMyqoKvoo5Sl3qnxQE1T30CjTfKrNpeOrW6+3ZmBgmGs0aII1VTLzNs+0OG9502rSetkWY8dkL+ag7ejiFO2c73LFddjt4x4mdw0Pf88Cry7v9778fs7++QH9gRvB8iFBoRVhoxFwpGyUJykv+kbMmzjqeKUEz8TcpNbk+X3M+00O7EtpTF08yJ++J6M083EWc7ZLTkXuqyMSeQn5/QUshRFFQ8eli8tKiCezyyjLj1cIV945E1RNebbxvOsFTG1Dncdlmiu3GhIapa69aappCWqTaP/U0d6V1mPey3xrtq/hzt4B00HWoZFhh/uzo0kPuB4OT+Q+tpsUegY9n3nZP103mz9HmrdbYF+sXBJ+d/WD5vLwJ4/PH1ZSvlGvnvzBtVa5wfYzfzv+zEAHRIJKcB9sorH3h05CfdBnmA+2hdPhFngJ4UWc0fU+gEEwmpgkTAtmBauAjcN24rA4K1wZbhGvhj+Kf0PQJ5wlI5BFkj0jNyfvoVBCI61LOUTlQrVI3E/NSN1AY0XzkbaYTpNugf4Ugx0jFeM9pmxmcxY6lknWc2wkdh0Oeo63nP1cZ7kzeUJ47fl0+GUFhAW5hdiF2UR4RMXFVMTNdnlJ7JUsleqUfiVLlFOXJylcUfygrKCSqjqmLqKRrvla21ynRU9c/6whr1G1iahpk7m+xWOrSBtK2wZ7N3S9drrEucnvXnXv8Tzi7e6r6E8Z8CSoNMQkdCE8MWI9KoY0F2Mdey2eNoGU+DBZde+Z/RQHElLm05wPDmXoZrZnyWc352ocHshzyX9bsL+I9lhVsdSJtpOapd3l6qeaK7Gnzc8cr3p5Vuxc/Pm+C4y1/hfbLxEv+17paGC8Gtk4eF0EzXzetdq0tdzg6sjsfN/t1HOzV/zW8dub/cF3Hg5o36sbYvorevjeCPto4NilB4vj/BNOj9IeX3hyb3Lu6fpzmhfcL8WnFKZVZzRntV9pz2m+Vp1XeiOzILbI95b4dmGp7V38e4X3Sx/OLbt8JP/Y8cn/M83n1i+7V8BK1VfdrzPfDqxyrLZ9d/i+/OPwmvBa77r7+upG0U+pnwObvlvxj/aXk90+PiBKXQCwLzY3PwuhSUUhABsFm5trVZubG9VosvEMgJ7Qnd92ts8aGgDKq/+n31j+CyJLz+HFlmnPAAABnGlUWHRYTUw6Y29tLmFkb2JlLnhtcAAAAAAAPHg6eG1wbWV0YSB4bWxuczp4PSJhZG9iZTpuczptZXRhLyIgeDp4bXB0az0iWE1QIENvcmUgNS40LjAiPgogICA8cmRmOlJERiB4bWxuczpyZGY9Imh0dHA6Ly93d3cudzMub3JnLzE5OTkvMDIvMjItcmRmLXN5bnRheC1ucyMiPgogICAgICA8cmRmOkRlc2NyaXB0aW9uIHJkZjphYm91dD0iIgogICAgICAgICAgICB4bWxuczpleGlmPSJodHRwOi8vbnMuYWRvYmUuY29tL2V4aWYvMS4wLyI+CiAgICAgICAgIDxleGlmOlBpeGVsWERpbWVuc2lvbj4yNzQ8L2V4aWY6UGl4ZWxYRGltZW5zaW9uPgogICAgICAgICA8ZXhpZjpQaXhlbFlEaW1lbnNpb24+Nzk8L2V4aWY6UGl4ZWxZRGltZW5zaW9uPgogICAgICA8L3JkZjpEZXNjcmlwdGlvbj4KICAgPC9yZGY6UkRGPgo8L3g6eG1wbWV0YT4KY0HzOwAAHEtJREFUeAHt3Qe0NEWxB/ABURQDRsyKATPBHFABc8IsigERc8IsGA8ImHPWI4gJs6IkQRFUMOecwZwzCMb3vl+/V3v6zs7szu7Ohvt9XefcO7MzHWu6/11V3V292f9soKpQ4UDhQOHADBzYfIa4JWrhQOFA4UDiQAGS0hAKBwoHZuZAAZKZWVgSKBwoHChAUtpA4UDhwMwcKEAyMwtLAoUDhQNbLIMF//nPf6p//vOfleu///3vdHXvL6dznOMcg5/nOte50v2WW25Znec85xk8LzeFA4UDy+fAZoua/gUSZ511VvX3v/99CDCmYQOQAS5bbbVVuk6TRolTOFA40A8H5gokAR5/+9vf+iltSypABaCQVHIppiV4eVw4UDjQMwfmAiRdAUSn90ddCaoDgbRGqT8Rz1VcUsr5z3/+Aig5Y8p94cCcOdA7kJxxxhlVmwSio5Mc0PnOd76pqgZY2Ff+8Y9/JFWpKZHIZ9o8mtIszwoHCgfaOdAbkOjcf/jDHxpzCltG30bScaBSAKXxc5SHhQO9c6AXIGmTQqgYi7JbjFKnlKNIJ723nZJg4cCAAzMBic775z//OakagxQ33JAELnKRiyzFTrGKZcp5U+4LBzZGDkwNJDrsb3/72yGerMro3yQlLRPghhhVHhQObEQcmApImuwhOukFL3jBlVrTAezYbVyDVrGcUbZyLRxYrxyYGEiaJBHGVKrMKpLyWgiXzyQVyWQVv1Qp03rmwERA0gQijKkkkVWmAiar/HVK2TYGDky0aY9hNSeSyKqDiPKSQMzasN8EAZe26eoIU66FA4UD3TjQGUh0OraRoFVWZ6KM9SvpKV/LAkzq4FiPU34XDhQOjOdAp92/ACQHkbAxjE9+tUIoN6kEgER92E/63lEMnH7+859Xm222WXXRi160uvjFL96ZET/96U+rv/71ryn8la985erc5z5357ijAkaZRoXxDi+22267ccHm/v4HP/hB9drXvjblc9vb3ra63e1u1ynPv/zlL9XPfvazFJa0fJnLXKZTvI0pEHvgs5/97FSlHXbYoXrQgx409+p1ApL6qL0e1Jk2zgET5c+nrjE+l1Ta4nZ9ftJJJ1VPetKTUnAq1cc//vEEKOPif/Ob36zuete7Vv/9739T0A9/+MPVta51rXHROr3PyzQqwhWucIXqxBNPHBVkIe9+//vfVx/60IdSXpe//OU7A8nJJ59cPeEJT0jxdt999+oVr3jFQsq7SpnYPhK8c78SQGI9hhE8yOwMtaYrvf3tb68+//nPV4cccsjARnHQQQel6M961rPSVUd+xjOeUd3gBjeo7n//+w8l7f373//+6lvf+lb1ox/9KG3iywNd7nKXq573vOcN0s/fNd0HmARAhoozD4DEv1e96lXVgQce2FSUNc9e8IIXDEBkzYvyo3BgxTkwUiLRwXTiIAAyCYiIB0Cg4m677Vbd7W53q4isb37zm1OS97nPfZIY/bGPfaw6+uijq49+9KNDQHLKKadUT33qU6tf//rXUYyhq5H8lre8ZUp/6GXLAxII3yih4oT6Nmn9WpJf8/id73xn9eAHP7gCeG106qmnVv4WQTe5yU2q/fffvzGrfCd2Y4DysHCggQMjgSQHEXHzWY+GtBofARF09tlnp2v89iPum955/9WvfjWJZblE5HkTRRpN79qe5SqOPADLPICEG4QXv/jF1Stf+crGojhaiDSyKNp66617U5kWVeaSz2pzYCSQMEQGGcHn0cki/foVyLAzdAGRetyuv6k46hX1JJXIz/O+iMH0hz/8YXXMMcdUD3vYwxo78LHHHluRqhAbxWmnnTbIHh/e+MY3pt+XvOQlq3ve856Dd3HDnvC+972v+te//lXtvPPO1XWuc514NfOVJEgq/O53v5uA9qpXvWp1/etfv7rGNa7RmvZ3vvOd6gtf+EL1ve99L/FXnJvd7GbVJS5xicY4f/zjH6vjjz+++spXvpKMvTe84Q2rC1/4wo1h+3ioPvj94x//OBnCr3a1q1W3uMUthuxk1Olf/vKXKcvHPOYxyXge+X/2s59NdfSbpB1GXd/hV7/6VZLA2bd8S9I2PpLAt99++/SthGEPu+xlL1t9+tOfrkjlBu6rXOUq6fnFLnaxyGpwNSCxdfkW2pQwvgVj9LKpFUjCfhAFnEYaibjTXNlV8g41TRpd4qhXAAkQ8TH7tJVQadhHSEykjre97W1riiXPl7zkJenZpS51qerud7/74LeHVA2N9jOf+UwKc8UrXnEIKF7+8pdXRxxxRGroDIx90Tve8Y7q+c9/fnXmmWeuSdJs1AMe8ICkcoZ/GQFIdC960Yuqt771rVX9AEfhnva0p1X3u9/91qT1jW98o3r4wx++RnWV7yg1cE0CE/wwk6YMTSqk/NT1Rje60SDF9773vcm+58GjH/3oNUDie7B9oetd73oDIHn3u99dfelLX6q+9rWvVQ996EOrvfbaKwG8cMAXkEQY5dhmm20S0HgfZOA4/PDDq2te85rxKIHWM5/5zGQaGDzccHPYYYdVt7rVrarXve51vQ6AeR5d7lvXkYTtQCJG7T5H6S4FY1hdBKlXLmnl9e4jf1O/e++9d0pKwzEa5qRRnX766enR4x//+Oqc5zxn/jrd77PPPoNnjNc5AUGzO2iXXXaptt1223Q/7p+OXv/L43zwgx+sGMOBiMauDo961KNSZxAPWDznOc/JoyTAfMtb3pLS1WmEF098ICO9I488chCHIdr7sH/d6U53qp7+9KcnqesXv/jFIFwfN6Q1sxcBIrvuumv1uMc9LuWF56bdleUnP/lJH9mliYFHPOIRCUQAL7r61a++Jm2DJWmFzco3DvC0ZqvO2wMOOCCBCLX0Xve6V6oLviLSTL1drMloAT8aJRKNM1cplmGAM3osikglscpVvYFJDi6zlkODete73pUWv73whS9M6ofGhc9hN7F2g4h86KGHDmXHUG0KVCOnBumQF7rQhVI4v3VIZPTrQscdd1x1pStdaSjoTW960wQQpDJGciQfU4mxFkbnk8/nPve5yoh973vfu7r2ta9dffnLX04iuzg3vvGN04gaoEjiuMMd7lD96U9/Sune+ta3rs573vOmunqGpOsviMi+3377xc+Zr29605vSjJ+EANyTn/zkQZqkuAc+8IHpu+uwMRkwCDDFzW9+85ukesiXuglI45vlyb3+9a+vbnOb26RHZi5vfvObV0CUakgrCOnYmppPfepT1V3ucpeBrZK6hU+WC/hG6rAsapRIwggahSKRLJrqovE8869LWz56n3SBC1ygeuQjH5mSpJsbhdDhG8TXWM/CHlQvRwq04d/mm2+eRku/gdx73vOeeJXEZD9IIiSSPoitgt0CGf0CRPwGDg95yEPcJsnDGhlkVIxvRqQPEPFOfCobAtiM6EgctMUWW6QROf34/39hc8ifzXKf58VWlRP7TazXITH2JZVSOdleDMRNIGIwCRBRHr/zb0hKCjKQWBqRmxikGeqPZRHLpEaJJGfkMkBk0QzRgetG177LYBQHHIxsL3vZy9LI84Y3vCFlY0TPG1RT3jr0S1/60mTDMZ2ss5JQvvjFL6bg0g8Ruil+/kynYfirE2MuYsgLYvyrU77yNcLGVdimOPkzSwCM0mEDAzR5B6nn18dveSJ1BOx1UicgTyJlhGWAnYV8C5LZpER1CaoP6J5TNdlfGIH9BeD3PfhFGbpeG4FkHmpNLFvOUda9Rh3vuhZ6HuEYA3OjKx60SQjT5G9UsuLSmhg2Eca7WAr/lKc8ZWySyrfHHnskdQDfPvnJTyb1QkRqQtNsTluiZgrue9/7tr1es/9I2nXKn1mSjnLjfG6Ajbj5M3F0kmj8fYJIPgjG9gL2kcgrL0eUzTV/HnXK3y/7nh2JGsweFnVZdpny/IdUm+hMEagvWwHdn0GJ1TzIvWdNdoEIs6hrHTRyMO2rDMT7GM1N+SGibD5TMCovUgc1B5lm/MAHPpDu73GPe/Tqkza3n9D165Q/i7BxFTbUtTxePU4u7od9Kg8/7X0YbsUP4yU1C3iiprLVn+d1SZE2/Au1LX4v8mp6nwTJzoZv1GR2nI985COd2868yzsEJPUOVO9g0xbIqGAfRL7Izb1n3i2b1DOvaz6y9VU2IEAiCSL+dpFGIrzOwFCJrLv43e9+l9QZANMn5WtErDauU9gbPA8VYFycfP9OxImOrh51Hd+zSUlnZ3wOMlUeFOVj3DU9m5MRPqbXbbL0h2JWxL1p6pwW2WZJISHJU4+1GQMQdRGwrAINAYlFL0Gbgn0k6uqaA0mTfpqHnfbeUv7b3/72CQBMN0YD75pebMAKwDfTkneYrumMCkdquuMd75iCmC5l09EBSatHHXXUYIEcYCMNIapVGEitaRBOBxVP/Oiopngt0kNmqYIs2WdnMWNhKrNtCX+EjytANaVsBokx0iI4pGzWVwTtu+++g++rIzIoa+vU6sc+9rGDma985igATxqvec1r0vQricdMi9mYRVGuNubSm7qb3VkFGrKR9D0S2/0a05PjKrzsIyOge9Q/Ouq4Mk/zXqPUiM1WTEo2NrLUxzobYDQPMsVsFDYSWnjljwQVIj47iY2SYYcw6FjQZaqXQVCHzMMrIwnEoqqgsPnozKSE3OB83eted0hyiHj51WxX3WZAlVH+fObI6lphLZg7fYONCgCSEGOntTRNs++5556D5NmRLA5jyyJR5VKVxYOx6nUQYU43DNOvfvWrU+qxOpqR1bcBmPX6z6kYI5Mdkkjy0NM09Dy+e9NfXWmSsF3TXNVws/A2lprrmPl0YZ91JdZbb2Kq99KXvnRKGoiYcrQkm35uIVVOfhsl+Q4RLkBHp2MLk16uLgAhdh51CH7EVLnVrfX087zckxpzwAdm1lWQUHJpJOJZz2MBIJASFoiQQklI1s2w1YUNShxrOMyQ5VKjZ0DSFHzMckX687raMgAYgbcByPQ53sYq4j6N1dPWYchnK2NUfBxMm1W9IXoRx8ehJqs5A5KGgCzO8RG7koaQjyZd4+XhSE5hw9HA8kafh1vmPfFfR9aQjO466CIIb3zDSXjCzgEsujR0oCA8kAxQ6VIvbdWUOlCgWuVAMCq+8NQU9pAuEwqkEioGUM1V4FF59P1OXal+yhuDSd95TJvekGwdIDJtgvV4gMGqOyNb2/Jji23onE3W8np68/ydN5C++dBXuYnaQATwWluyKKJ2Tqp6Nm08aysvtTJsLG1hmp77ZtPEAzgkpa5EUmpaf9I1fh/h1DUM1H2k12caI1WbvjICEKPEVO+WDSJ91XWe6RhBY68KQ2WXkX6e5SlpFw4EB4YkknhRrqvHATMo9HvSSCy5X71SlhJtihwYAhLiU4j1cd0UGbOKdTbTENOtq1i+UqZNlwMLUW3WC3tz4MztJeul/KWchQPL4sBIiWRZhZIvL1/11YRWP9aX8PdZxnwxXgGSPjlb0trYOTAEJHmFTclNaqnP489y3yTG3/nOdx64JJwl7ba4RSJp40x5XjgwmgNDqk2+dj/vWKOT2Tje5vWdZC3DxlH7UovCgek5MAQk+eIcHSvvXNNnsz5i5nUtqs36+GallKvBgSEgqXegvHOtRpHnU4q67SUH1ElztHHM0m8rLseRTVjCclZTaH1wwH4smwpPOOGEXgts+X7u/a7XxOecWCOQ5J1o3NL2OZdvYcnXd/vWAXWSgvCwZc8JB8njyK5VYR0xUGh9cMDKYruapzlLqa2G0nLUhL8+023Lr+/njcbWfBds7IbtO+NVSy+v56z7i6JuAIUrRMcVNJF9M7azFyocsCcpXBjEjur1xJUhiUThc4mEapN3svVUua5lpdbkKlzudq9rGvVwttA7foDakk8r5+EcwGSfSFnqnnNl073XXupHVqwXbjRKJIDEXwCIHbEOD99Yqa6+5UA6bZ2Jv6aw7Urmx6J+Ghr/GyQWo1Dd1aS4vJDZOc3nhc1iHCL5C3JsAn8edqV+4hOfSLtCbULjkm/b7Gyb2J/D0TLAtGWen43wAiY9To85IoqdpQ5xipPuuHYAdMRt+3y+/e1vV3ya2gXrpLjcqXOUjQsAGzQ5EMp9gthxy4G10wTxRj1P3uAhj9Mj5eR6gA9f0/wxe+gdr/vSiqMZ5OPcHeW2vR7xYetIDEdNcElI0sMP8eqkLuI7EdCOXu4AeJ4LyVF7sNHUezYsO21tkMwdHdXT9Jt66kRFR6koP4dT6pn3Hd+Ny011581NWNsd1NuRE/jFsXeQ3fgGI23FYMfplLLkafJip/7qYne2Iy38GcwWRY0SiczjQ7oHKAEqfm9MVK9bX2oNHpE2bEjUYMI9gecahIbMz0Xu68I7pOEAEn4oNCq7oxnhdJQgW+55EtPRdt1119T5NCROk8LeI09Axt7DxYIzUTRcHsw0ZMTJjziAwVkvgIjHdeCEF/5IVJwWcaakgT7xiU9MIyfPZ+EJPsrlutNOOyUgcfZNThYYStt7BHDYiACXzgQonSrIzwbQQcCPz9JcYvRc3TwP0vml7SRDDn/wPfKJMK7q4sRDIA0k42wY/A7bhGMk8MVZPNxY4h/HQuwibaSu4gFDrh14jPONHHSVl9MzB2P5drznK2e4BPD9csfTjPUHH3xwcgwmPQ7DkfJHWZ11o73gHTeeAPH73/9+qxTcVv5ZnzdKJBLVgPLG70PNMlLno0m90KPe5WF9pDaKEbTtfdvzujTSt5qh87KTGPHDc7tRWOPiaKeJuCM0KsdoHh7RpJOf62skzc+k9X10TrYXcdTluc997hrVCXCSLEgA4nOSIx4AcSXNaNBGZB3NehojnkatocYubeBGgjECK0NOwFHaDIdcQQYBJ/GkQWJxhoxdzCGtEestgHRMhw4yqdMmIAEgcy9skXdcjdykPN7SQppyzR0hkRKptzGik94cbGZmDWjXif9WzrjxPPcPwysbicigkUsZpCUnCobDqHp68RtAADGuIGNg545DXPXgUY7UBJCiXDymdXUmHvn0cW2VSFQgH53rI/ekmRPD48PkcT3zrgs51a2JfOhpvKupUz7tq77q3Sc5p8QH1zF0RvnpfKSNNj8aGk2AiLLozPxQ1EdE9c55Gr5Q46wTcevASK1AESbOUcnT4atD/sEL09m8c+mA6hF/pIamExGl5Xt4F+fJGImpRfGdjJo6PdeROVEfxA/fq/m7Lve5H9im8NQPA1KASFMYdc35gWd+1/kfcfGFihlOueI53vvG9boINw5E8EY80goJJnhOAtVOgTjSLrQrR6W2+fuJ8szz2iqRyBQjoqMRLUkouW42ScGMRDyemRINj9iYQHT0rgtx4UfENN8eH3XHHXdMRxXmHa9LWsLkEpff9U7nWR8UQGKE0YAAGPvCKNLgNSANJkTecXyKjh9qi/TVkdjNnoBnwbcIwy2B0/L4ZDWSyct0NLE+OpNnwC0ab5SbFGgEbCJpkXxIJfR6IyhpI+wQIe7XnQWRBOj5uZPjpvTbno2TmqU7SrKVLgmDpMaOBQDxDL+CZ/W8o6wByvl7IKTu1M2QKuKah6vfU11CRa3zneQWA4K2pbwnb5ByHXGCd2wwDl1bJI0EEg1T54oOpwNwuTft/hujT30EmqSyRkoN3N+sBCDVJ0g9oyPGs76uGjcVB4gaZYzKoxrzEUcckXR43uY5JBaWuJ+Xt0vZjJSMm9tuUFekY3Sk0sR5w9JQb6OzzsIGYjTmwDm33ZB8DCTUn66kzo7CtGiLwZAvFeJ3bD0IdZaj6BxMdB4gw26CAszaOnHX8kQ4vDSCt5EOzNbhqpNSwwCEA97bKOrS5OQcCADHLuCRp0/qEM9gO4rv+oSzi3n9N/g4uoIXPUZdKs+iqFW1iQLUxX02hUkbdKS1KledwigbBECmBcdIY9zV8Y0kCg0KQLSRcrElsPZryEZ8ZZumI5E0dFw2DJIbaTI6cuRP9WCrYJOhx7Pj5CAinM6k8zWpMZFO0xV4IW40dczc5hG2lvqKXuXxfeKIjQAZxs+c6rat/N2oe6BKgmiry9e//vVkQDb7wxCqM44DAbND1n6Im5M6M0aH9JC/63JPVcWfLmfoABTfzZEcVM62g8C65DtNmJESiQRDKomOF51wEifA0xRsnnGiLpFHjCjxex5XI6tZESAMnNvISC6sjqMhk5zMKGiQbTaVtrR0ACM+EKBrM8LWl2DrKDqroyUAFonEbx0OkLknSQA305OmHqlnOqNn1Js2Gxe+Up3MkLAL5KI/KWiHHXaorKXRxnQaaoTySTNAiFpEbeW1Xn2M0lQFRsZpiFH15A1qAAnPSI8vplbNrDn7JhaDeaaNK5OZJR21jcQhFTC4kt7UlWQVh3WNs9u0pUtFOeigg5I6zwCPf8wCjN++Dd4y4mtP2go+kvyUx/dbJI0FEoVRUAASKk6AySI6YN/M0AFyiUrdxunVfZVBhxhny9FRdFb2lGgUGg3VqH5C3LhyiUfcJeZqZEZ5Hv2pO0E6DHGfIdt3NdLrPIx7jHdmN5R5v/32S+szePrXSTyz9iE6fKRXv9LVAUm+BibCOKOFHQWYUAsAhVHVVHV8E0BmJsR0KfuY3/IEAtaLTEo6mbqYJpYeSU/nJ5HhgzYNCNSTAZMU53uMIwClLQEPf4CHWiKvNjvSuDTNfNnTw7bom5E0AD37E94jYagzQExdDAym0udl72sr89BxFG0BAzzqnXA9gUkdRDTWaY3HbXzq6zlxNuwHo0bDLvmZUaDSAKmcNDzTk0CKPSMno7BpStPHOYljQNGggdM4IsVYG5Gf+dwUR12VL2wi9TDyBTZ9dhDTxdp1k+pCEvQNANekRKXB77oaOWk6eXhlVSZSYxOP5Alo6t84T2Oe9+3yWi1XjQZo5I1HxZoMTLWoK/GTOpODoHqsKohgmBEfv2cFEWnpDE0NTIM0QpMYQqfWGKkNnhGX6ySO9PJ2UA8Tvx0czm4QU77xvOkKmJo6SIT1rk8Qka6O3gQi3pEupgERcfG0TxCRpvTUv41H8mz6xuIugjpLJFEYCG5kdw3C9FWWTOqSiHIDkRCfox6b4pX9hIpABdJYfVejHrXIKsm2htuFV9QH6R544IG9d6wu+Zcwi+PAxECiaE1gEiN8l5FqUdVTziZJBOgVEFn7Fdg98GqWkXhtiuXXpsSBqYAEg9rAhHhlRFs2UbvqszNAroDIsr9MyX9j5MDUQIIZTWDi+TKlkyYpJMq0nqes1aFQ4cCqcmAmIFEpHdfoH1PDUVFgQn0goSxCjWgrh/Ksug0neFauhQPrlQMzA0lU3IwIVUKHrpOOzDru2jfJ19oHYFanosrUOVJ+Fw7MhwO9AYnijZIKvA8pZRZQkQfwcK1LQfIIMlW2CraaKE+5Fg5szBzoFUiCUeMAJcIBlvgz9eg+J+kEmVXI14HE8/oVgJB86mnVw5XfhQOFA/1xYC5AEsULQKF65KAQ7/u6Ao1VmS3qq04lncKB9cSBuQJJzghAQhVx7SJZ5HGb7gM8GHIXYcxtKkN5VjhQOPB/HFgYkOQMDzBxjf0O7lFc3efqCbAI9WceRlv5FSocKByYjgNLAZLpilpiFQ4UDqwqBzpv2lvVCpRyFQ4UDiyfAwVIlv8NSgkKB9Y9BwqQrPtPWCpQOLB8DhQgWf43KCUoHFj3HChAsu4/YalA4cDyOfC/ugiA4YDshRUAAAAASUVORK5CYII=';
        var width = doc.internal.pageSize.width;

        doc.setProperties({
            title: 'My Food Fournal',
            subject: 'My food journal on ' + new Date().getTime(),
            author: userName,
            keywords: 'generated, javascript, web 2.0, ajax',
            creator: 'Jorge Asuaje'
        });

        doc.addImage(dataUri, 'PNG', 14, 10, 69, 20);

        var columns = ['Calories', 'Carbs', 'Protein', 'Fat'];
        var rows = [
            [
                this.journal.get('calories') + ' kcal',
                this.journal.get('carbs') + ' g',
                this.journal.get('protein') + ' g',
                this.journal.get('fat') + ' g'
            ]
        ];

        doc.text('Daily Totals', 14, 40);
        doc.autoTable(columns, rows, { startY: 44, theme: 'plain', styles: { fontSize: 15, fontStyle: 'bold', halign: 'center' } });
        doc.line(14, 42, width - 14, 42);

        var columns = ['Carbs', 'Protein', 'Fat'];
        var rows = [
            [
                this.journal.get('carbs') + ' %',
                this.journal.get('protein') + ' %',
                this.journal.get('fat') + ' %'
            ]
        ];

        doc.text('Macronutrients Ratios', 14, doc.autoTable.previous.finalY + 10);
        doc.line(14, doc.autoTable.previous.finalY + 12, width - 14, doc.autoTable.previous.finalY + 12);
        doc.autoTable(columns, rows, { startY: doc.autoTable.previous.finalY + 14, theme: 'plain', styles: { fontSize: 15, fontStyle: 'bold', halign: 'center' } });

        columns = ['', 'Servings', 'Calories <kcal>', 'Carbs <g>', 'Protein <g>', 'Fat <g>'];
        rows = [];

        doc.text('Meals', 14, doc.autoTable.previous.finalY + 10);
        doc.line(14, doc.autoTable.previous.finalY + 12, width - 14, doc.autoTable.previous.finalY + 12);

        _.each(this.journal.get('meals').models, function(meal, index) {
            var tableTitle = meal.get('name') + ' - ' + meal.get('calories') + ' kcal';
            _.each(meal.get('ingredients').models, function(food) {
                rows.push([food.get('name') + ' - ' + food.get('brand'), food.get('servings'), food.get('calories'), food.get('carbs'), food.get('protein'), food.get('fat')])
            });

            doc.text(tableTitle, 14, doc.autoTable.previous.finalY + 20);
            doc.autoTable(columns, rows, { startY: doc.autoTable.previous.finalY + 24, theme: 'grid' });
            rows = [];
        });

        doc.save('MyFoodJournal.pdf')
    }
});
