/*
 * orbital.js
 *
 * Copyright (c) 2019 NAVER Corp.
 * Licensed under the MIT
 */

import img0 from './images/0.json';
import img1 from './images/1.json';
import img2 from './images/2.json';
import img3 from './images/3.json';
import img4 from './images/4.json';
import img5 from './images/5.json';
import img6 from './images/6.json';

const sample = {

    productCategories: [
        'T-shirts',
        'Bags',
        'Clocks'
    ],

    products: [{
        id: '0',
        name: 'White T-Shirts',
        price: 100,
        category: 'T-shirts',
        img: img0.data
    }, {
        id: '1',
        name: 'Gray T-Shirts',
        price: 200,
        category: 'T-shirts',
        img: img1.data
    }, {
        id: '2',
        name: 'Purple T-Shirts',
        price: 300,
        category: 'T-shirts',
        img: img2.data
    }, {
        id: '3',
        name: 'Pink Tote Bag',
        price: 400,
        category: 'Bags',
        img: img3.data
    }, {
        id: '4',
        name: 'Gray Tote Bag',
        price: 500,
        category: 'Bags',
        img: img4.data
    }, {
        id: '5',
        name: 'Black Watch Clock',
        price: 600,
        category: 'Clocks',
        img: img5.data
    }, {
        id: '6',
        name: 'White Watch Clock',
        price: 700,
        category: 'Clocks',
        img: img6.data
    }]
};

export default sample;
