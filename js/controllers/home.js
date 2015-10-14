module.exports = function() {
  this.render('home', this.t('home'), [
    {
      property: 'og:description',
      content: 'Home'
    }
  ]);
};
