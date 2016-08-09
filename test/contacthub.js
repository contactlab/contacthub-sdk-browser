import sinon from 'sinon';
import xr from 'xr';

sinon.stub(xr, 'post');

import '../lib/contacthub';
import './config';
import './event';
import './customer';
