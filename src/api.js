import AnywhereRest from './AnywhereRest';

const { PORT, REQUIRED_ROLE } = process.env;

const res = new AnywhereRest({ requiredRole: REQUIRED_ROLE });

export default res;

if (PORT) {
  res.listen(PORT);
}
