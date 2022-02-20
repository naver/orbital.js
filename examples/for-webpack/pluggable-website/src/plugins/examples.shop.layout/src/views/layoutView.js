import css from './css/layout.css';

const layoutView = `
    <div class='${css.page}'>
        <header>
            <a href='/#'>{{logo}}</a>
            <div class='${css.desc}'>
                {{desc}}
            </div>
            <div class='utility'></div>
        </header>
        <aside></aside>
        <main></main>
    </div>
`;

export default layoutView;
