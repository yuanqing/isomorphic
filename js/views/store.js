var map = require('savoy').map;

var StoreActionCreator = require('js/action-creators/store-action-creator');
var fluxStore = require('js/store');

module.exports = require('lib/component')({
  render: function() {
    var products = [];
    map(this.props.stores || [], function(store) {
      map(store.products || [], function(product) {
        products.push(<h2 key={product.id}>{product.name}: {product.quantity} <button onClick={
          function() {
            fluxStore.dispatch(StoreActionCreator.setQuantity(product.name, product.quantity + 1));
          }
        }>+</button></h2>);
      });
    });
    return (
      <div className="Store">
        <div className="Store-Products">
          {products}
        </div>
      </div>
    );
  }
});
