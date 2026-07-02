jest.mock('@stripe/stripe-js', () => ({
  loadStripe: jest.fn(() => 'mock-stripe')
}));

describe('stripePromise', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
    delete process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY;
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  it('returns null when the publishable key is missing', () => {
    const { stripePromise } = require('./stripe');

    expect(stripePromise).toBeNull();
  });
});
