
import {arrayFilterEmpty} from '../utils/helpers';
import {
    cssLoader,
    cssLoaderItems,
    cssModulesSupportLoaderItems,
    lessLoader,
    miniCssExtractLoader,
    postCssLoader,
} from './useLoaderRuleItems';

/** css **/
export const cssRule = {
    test: /\.css$/,
    use: [miniCssExtractLoader, cssLoader, postCssLoader],
};

/** less **/
export const lessModulesRule = {
    test: /\.module.less$/,
    use: arrayFilterEmpty([
        ...cssModulesSupportLoaderItems,
        postCssLoader,
        lessLoader,
    ]),
};
export const lessRule = {
    test: /\.less$/,
    exclude: /\.module.less$/,
    use: arrayFilterEmpty([
        ...cssLoaderItems,
        postCssLoader,
        lessLoader,
    ]),
};

export const lessRules = [lessModulesRule, lessRule];

