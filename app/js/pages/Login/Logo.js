import React, {PureComponent} from 'react';
import logo from '../../../images/logo.png';

export default class Logo extends PureComponent {
    render() {
        return (
            <div>
                <img src={logo} />
            </div>
        );
    }
}
