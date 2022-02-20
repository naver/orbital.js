const banners = [
    {color: '#e5f1f9', name: 'Lorem ipsum'},
    {color: '#f9edcc', name: 'Dolor sit amet'},
    {color: '#fcefff', name: 'Duis aute irure'}
];

class RollingBanner {

    getBanner(cb) {
        setTimeout(() => {
            const index = Math.floor(Math.random() * 3);
            cb(banners[index]);
        }, 1000);
    }
}

export default RollingBanner;
