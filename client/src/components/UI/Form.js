import React, { Component } from 'react';
import styles from '../assets/sass/Form.module.scss';

class Form extends Component {
	constructor() {
		super();
		this.state = {
			newFormId: 1,
			deletedInputs: [],
			formInputs: [{ id: 1, label: 'Item 1', isComplete: false, placeHolder: '', value: 'Get form working', new: false, updated: false, _startValue: 'Get form working' }, { id: 2, label: 'Item 2', isComplete: false, placeHolder: '', value: 'see if delete works', new: false, updated: false, _startValue: 'see if delete works' }],
		};
	}

	handleInputChange = (id) => (evt) => {
		const currentInputs = this.state.formInputs.slice();
    	currentInputs.forEach((item) => {
			if (item.id === id) { item.value = evt.target.value; }
			if (!item.new && item._startValue === item.value) {
				item.updated = false;
			} else {
				item.updated = true;
			}
    });

    this.setState({ formInputs: currentInputs });
	}

	handleSubmit = (evt) => {
		const { formInputs } = this.state;
		let deliverable = {};
		deliverable.toDelete = this.state.deletedInputs;
		deliverable.toAdd = [];
		deliverable.toUpdate = [];

		formInputs.forEach((item) => {
			if (item.new && item.value.length > 0) { deliverable.toAdd.push(item); }
			if (item.updated && !item.new) { deliverable.toUpdate.push(item); }
		});

		evt.preventDefault();
	}

	handleAddInput = (evt) => {
		let currentInputCount = this.state.newFormId;
		let currentInputs = this.state.formInputs;
		const inputAddLabel = this.props.hasAddBtn || 'Item';

		this.setState({
			formInputs: currentInputs.concat([{
				id: `n${currentInputCount}`,
				label: `${inputAddLabel} ${currentInputs.length + 1}`,
				isComplete: false,
				placeHolder: '',
				value: '',
				new: true
			}]),
			newFormId: ++currentInputCount
		});

		evt.preventDefault();
	}

	handleRemoveInput = (xId) => (evt) => {
		const currentDeleteInputs = this.state.deletedInputs.slice();
		const { formInputs } = this.state;

		formInputs.forEach((input) => {
			if (input.new !== true && input.id === xId) {
				currentDeleteInputs.push(input);
			}
		});

		const remainingInputs = formInputs.filter((input) => input.id !== xId);

		remainingInputs.forEach((input, idx) => {
			let updatedLabel = input.label.split(' ');
			input.label = `${updatedLabel[0]} ${idx + 1}`;
		});

		this.setState({
			deletedInputs: currentDeleteInputs,
			formInputs: remainingInputs
		});

		evt.preventDefault();
	}

	renderAddBtn = () => {
		if (this.props.hasAddBtn) {
			return <button type="button" onClick={ this.handleAddInput } className="small">Add Shareholder</button>;
		}
		return
	}

	renderDeleteBtn = (id) => {
		if (this.props.hasDelete) {
			return <button type="button" onClick={ this.handleRemoveInput(id) } className="small" >x</button>;
		}
		return
	}

	renderInputs = () => (
		this.state.formInputs.map(({ id, value, label, placeHolder }) => (
			<div key={ id } className="shareholder">
				<label htmlFor={ id } className="label">
					{ label }
				</label>
				<input
					id={ id }
					type="text"
					placeholder={ placeHolder }
					value={ value }
					onChange={ this.handleInputChange(id) }
				/>
				{ this.renderDeleteBtn(id) }
			</div>
		)
	));

	render() {
		return (
			<form onSubmit={ this.handleSubmit }>
				{ this.renderInputs() }
				<div className="btnBar">
					{ this.renderAddBtn() }
					<button>Incorporate</button>
				</div>
			</form>
		);
	}
}

export default Form;