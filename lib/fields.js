const Fields = {
  CharField: input => (condition = () => false) =>
    typeof(input) == 'string' && condition(input.trim()) && input.trim(),
  BoolField: input => (condition = () => false) =>
    typeof(input) == 'boolean' && condition(input)
}

module.exports = Fields
