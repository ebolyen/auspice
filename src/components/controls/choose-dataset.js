import React from "react";
import { connect } from "react-redux";
import { withTheme } from 'styled-components';
import ChooseDatasetSelect from "./choose-dataset-select";

const GithubInfo = withTheme((props) => {
  const parts = window.location.pathname.split("/");
  const repoURL = `github.com/${parts[2]}/${parts[3]}`;
  return (
    <div style={{ fontSize: 14, marginTop: 5, marginBottom: 5, color: props.theme.color}}>
      <i className="fa fa-clone fa-lg" aria-hidden="true"/>
      <span style={{position: "relative", paddingLeft: 10}}/>
      <a href={`https://${repoURL}`} target="_blank">{repoURL}</a>
    </div>
  );
});

const DroppedFiles = withTheme((props) => {
  /* TODO: this shouldn't be in the auspice src, rather injected as an extension when needed */
  return (
    <div style={{ fontSize: 14, marginTop: 5, marginBottom: 5, color: props.theme.color}}>
      <i className="fa fa-clone fa-lg" aria-hidden="true"/>
      <span style={{position: "relative", paddingLeft: 10}}>{"dropped files"}</span>
    </div>
  );
});

const BareDataPath = withTheme((props) => (
  <div style={{ fontSize: 14, color: props.theme.color }}>
    {`Source: ${props.source || "unknown"}`}
    <p/>
    {`Datapath: ${props.fields ? props.fields.join("/") : "unknown"}`}
  </div>
));

const checkEqualityOfArrays = (arr1, arr2, upToIdx) => {
  return arr1.slice(0, upToIdx).every((value, index) => value === arr2[index]);
};

@connect((state) => {
  return {
    available: state.controls.available,
    datasetFields: state.controls.datasetFields,
    source: state.controls.source
  };
})
class ChooseDataset extends React.Component {

  render() {
    /* If the server hasn't yet returned the available datasets, show the
       source & raw datapath if we have one, otherwise don't render anything.
       This helps the user know what they're looking at.
     */
    if (!this.props.available) {
      /* TODO expose this to the extension API */
      if (this.props.source === "github") {
	return (<GithubInfo/>);
      } else if (this.props.source === "dropped") {
	return (<DroppedFiles/>);
      }
      return (<BareDataPath source={this.props.source} fields={this.props.datasetFields}/>);
    }

    const selected = this.props.datasetFields;
    const options = [[]];

    this.props.available.forEach((d) => {
      if (options[0].indexOf(d[0]) === -1) options[0].push(d[0]);
    });

    for (let idx=1; idx<selected.length; idx++) {
      /* going through the fields which comprise the current dataset
      in order to create available alternatives for each field */
      options[idx] = [];
      this.props.available.forEach((query) => {
        /* if the parents (and their parents etc) of this choice match,
        then we add that as a valid option */
        if (checkEqualityOfArrays(query, selected, idx) && options[idx].indexOf(query[idx]) === -1) {
          options[idx].push(query[idx]);
        }
      });
    }

    const selectors = [];
    for (let i=0; i<options.length; i++) {
      selectors.push((
        <div key={i}>
          <ChooseDatasetSelect
            dispatch={this.props.dispatch}
            source={this.props.source}
            choice_tree={selected.slice(0, i)}
            selected={selected[i]}
            options={options[i]}
          />
        </div>
      ));
    }
    return selectors;
  }
}

export default ChooseDataset;
