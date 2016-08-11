import React, { Component, PropTypes } from "react";
// FIXME: using pure seems to mess with redux form updates
// import pure from "recompose/pure";
import cx from "classnames";
import i from "icepick";

import S from "./GuideDetailEditor.css";

import Select from "metabase/components/Select.jsx";
import Icon from "metabase/components/Icon.jsx";
import DataSelector from "metabase/query_builder/DataSelector.jsx";

const GuideDetailEditor = ({
    className,
    type,
    entities,
    metadata = {},
    selectedIds = [],
    selectedIdTypePairs = [],
    formField,
    removeField
}) => {
    const {
        databases,
        tables,
        segments
    } = metadata;

    return <div className={cx(S.guideDetailEditor, className)}>
        <div className={S.guideDetailEditorClose}>
            <Icon
                name="close"
                width={24}
                height={24}
                onClick={removeField}
            />
        </div>
        <div className={S.guideDetailEditorPicker}>
            { entities ?
                <Select 
                    triggerClasses={S.guideDetailEditorSelect}
                    value={entities[formField.id.value]}
                    options={Object.values(entities)
                        .filter(entity =>
                            entity.id === formField.id.value ||
                            !selectedIds.includes(entity.id)
                        )
                    }
                    optionNameFn={option => option.display_name || option.name}
                    onChange={(entity) => {
                        formField.id.onChange(entity.id);
                        formField.points_of_interest.onChange(entity.points_of_interest || '');
                        formField.caveats.onChange(entity.caveats || '');
                    }}
                    placeholder={`Pick a ${type}`}
                /> :
                <DataSelector
                    className={S.guideDetailEditorSelect}
                    style={{display: 'flex'}}
                    triggerIconSize={12}
                    includeTables={true}
                    query={{
                        query: {
                            source_table: formField.type.value === 'table' &&
                                Number.parseInt(formField.id.value)
                        },
                        database: (
                            formField.type.value === 'table' &&
                            tables[formField.id.value] &&
                            tables[formField.id.value].db_id
                        ) || Number.parseInt(Object.keys(databases)[0]),
                        segment: formField.type.value === 'segment' &&
                            Number.parseInt(formField.id.value)
                    }}
                    databases={
                        Object.values(databases)
                            .map(database => i.assoc(
                                database, 
                                'tables', 
                                database.tables.map(tableId => tables[tableId])
                            ))
                    }
                    setDatabaseFn={() => null}
                    tables={Object.values(tables)}
                    hiddenTableIds={selectedIdTypePairs
                        .filter(idTypePair => idTypePair[1] === 'table')
                        .map(idTypePair => idTypePair[0])
                    }
                    setSourceTableFn={(tableId) => {
                        const table = tables[tableId]; 
                        formField.id.onChange(table.id);
                        formField.type.onChange('table');
                        formField.points_of_interest.onChange(table.points_of_interest || '');
                        formField.caveats.onChange(table.caveats || '');
                    }}
                    segments={Object.values(segments)}
                    hiddenSegmentIds={selectedIdTypePairs
                        .filter(idTypePair => idTypePair[1] === 'segment')
                        .map(idTypePair => idTypePair[0])
                    }
                    setSourceSegmentFn={(segmentId) => {
                        const segment = segments[segmentId]; 
                        formField.id.onChange(segment.id);
                        formField.type.onChange('segment');
                        formField.points_of_interest.onChange(segment.points_of_interest || '');
                        formField.caveats.onChange(segment.caveats || '');
                    }}
                />
            }
        </div>
        <div className={S.guideDetailEditorBody}>
            <textarea 
                className={S.guideDetailEditorTextarea}
                placeholder={
                    type === 'dashboard' ?
                        `Why is this dashboard the most important?` :
                        `What is useful or interesting about this ${type}?` 
                }
                {...formField.points_of_interest}
                disabled={formField.id.value === null || formField.id.value === undefined}
            />
            <textarea 
                className={S.guideDetailEditorTextarea} 
                placeholder={
                    type === 'dashboard' ?
                        `Is there anything users of this dashboard should be aware of?` :
                        `Anything users should be aware of about this ${type}?` 
                }
                {...formField.caveats}
                disabled={formField.id.value === null || formField.id.value === undefined}                
            />
        </div>
    </div>;
};
GuideDetailEditor.propTypes = {
    className: PropTypes.string,
    type: PropTypes.string.isRequired,
    entities: PropTypes.object,
    metadata: PropTypes.object,
    selectedIds: PropTypes.array,
    selectedIdTypePairs: PropTypes.array,
    formField: PropTypes.object.isRequired,
    removeField: PropTypes.func.isRequired
};

export default GuideDetailEditor;