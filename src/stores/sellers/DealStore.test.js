import DealStore from './DealStore'

describe("Calling onFieldChange", () => {
    it("changes form.field", () => {
        const store = DealStore
        store.onFieldChangeAddDeal("name", "Mr. Roboto")
        expect(store.form.fields["name"].value).toBe("Mr. Roboto")
    })
})

describe("Calling resetForm", () => {
    it("clears out all the field", () => {
        const store = DealStore
        store.onFieldChangeAddDeal("name", "Mr. Roboto")
        expect(store.form.fields["name"].value).toBe("Mr. Roboto")
        store.resetForm()
        expect(store.form.fields["name"].value).toBe(null)
    })
})