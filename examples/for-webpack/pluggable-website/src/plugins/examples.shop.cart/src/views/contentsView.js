import css from './css/contents.css';

export const cartView = `
    <div id='cartPane' class='${css.cart}'>
        <h1>Cart</h1>
        <ul>{ITEMS}</ul>
    </div>
`;
