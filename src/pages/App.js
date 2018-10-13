import React from "react"

export default class App extends React.Component {
    render() {
        return(
            <div>
                <div class="header">
                    <h2>Header</h2>
                    </div>
                    <div class="row">
                    <div class="column side">Column</div>
                    <div class="column middle">Column</div>
                    <div class="column side">Column</div>
                    </div>

                    <div class="footer">
                    <p>Footer</p>
                </div>
            </div>
        )
    }
}