import React from 'react'

export interface ControlledState<Value> {
  value: Value
  onChange: React.Dispatch<(prevState: Value) => Value>
}
