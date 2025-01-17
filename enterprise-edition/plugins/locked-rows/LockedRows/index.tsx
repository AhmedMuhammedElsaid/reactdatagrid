/**
 * Copyright © INOVUA TRADING.
 *
 * This source code is licensed under the Commercial License found in the
 * LICENSE file in the root directory of this source tree.
 */

import React, { ReactNode, useContext } from 'react';

import { TypeComputedProps, TypeLockedRow } from '../../../types';

import GridContext from '@inovua/reactdatagrid-community/context';

import join from '@inovua/reactdatagrid-community/packages/join';
import LockedRowCell from './LockedRowCell';

const defaultClassName = 'InovuaReactDataGrid__locked-row';

const renderCellsMaybeLocked = (
  cells: ReactNode[],
  row: TypeLockedRow,
  computedProps: TypeComputedProps
): ReactNode[] => {
  const startCount = computedProps.lockedStartColumns.length;
  const unlockedCount = computedProps.unlockedColumns.length;

  const {
    lockedStartColumns,
    lockedEndColumns,
    unlockedColumns,
    totalLockedStartWidth,
    totalLockedEndWidth,
    totalUnlockedWidth,
    computedSummary: summary,
  } = computedProps;

  let lockedStartCells: ReactNode = cells.slice(0, startCount);
  let unlockedCells: ReactNode = cells.slice(
    startCount,
    startCount + unlockedCount
  );
  let lockedEndCells: ReactNode = cells.slice(startCount + unlockedCount);
  const rtl = computedProps.rtl;

  if (row.renderLockedStart) {
    lockedStartCells = row.renderLockedStart(
      {
        columns: lockedStartColumns,
        value: lockedStartCells,
        summary,
      },
      computedProps
    );
  }
  if (row.renderLockedEnd) {
    lockedEndCells = row.renderLockedEnd(
      {
        columns: lockedEndColumns,
        value: lockedEndCells,
        summary,
      },
      computedProps
    );
  }

  if (row.renderUnlocked) {
    unlockedCells = row.renderUnlocked(
      {
        columns: unlockedColumns,
        value: unlockedCells,
        summary,
      },
      computedProps
    );
  }

  return [
    <div
      key="locked-start"
      data-name="start"
      style={{ width: totalLockedStartWidth }}
      className={join(
        `${defaultClassName}-group ${defaultClassName}-group--locked-start ${defaultClassName}-group--${
          rtl ? 'rtl' : 'ltr'
        }`
      )}
    >
      {lockedStartCells}
    </div>,
    <div
      className={`${defaultClassName}-group ${defaultClassName}-group--unlocked ${defaultClassName}-group--${
        rtl ? 'rtl' : 'ltr'
      }`}
      style={{
        width: totalUnlockedWidth,
      }}
    >
      {unlockedCells}
    </div>,
    <div
      key="locked-end"
      data-name="end"
      style={{ width: totalLockedEndWidth }}
      className={join(
        `${defaultClassName}-group ${defaultClassName}-group--locked-end  ${defaultClassName}-group--${
          rtl ? 'rtl' : 'ltr'
        }`
      )}
    >
      {lockedEndCells}
    </div>,
  ];
};

const renderLockedRow = (
  row: TypeLockedRow,
  rowIndex: number,
  rows: TypeLockedRow[],
  computedProps: TypeComputedProps,
  position: 'start' | 'end'
): ReactNode => {
  const id = rowIndex;

  const firstUnlockedIndex = computedProps.firstUnlockedIndex;
  const firstLockedEndIndex = computedProps.firstLockedEndIndex;

  const lastLockedStartIndex = computedProps.lastLockedStartIndex;
  const lastUnlockedIndex = computedProps.lastUnlockedIndex;

  const rtl = computedProps.rtl;

  const colspanned: { [key: string]: boolean } = {};

  let cells: ReactNode[] = computedProps.visibleColumns.map(
    (col, index, array) => {
      let colspan: any = row.colspan;
      let computedWidth = col.computedWidth;

      if (colspanned[col.id]) {
        return null;
      }

      if (colspan && typeof colspan === 'object' && colspan[col.id]) {
        colspan = colspan[col.id];
      }

      if (typeof colspan === 'function') {
        colspan = colspan(
          {
            column: col,
            columnIndex: col.computedVisibleIndex,
            rowPosition: position,
            row,
            rowIndex,
          },
          computedProps
        );
      }

      let lastIndexForCurrentColumn = index;
      if (colspan && typeof colspan === 'number' && colspan > 1) {
        let remainingColumns = colspan - 1;

        let spanColIndex = index;
        while (remainingColumns) {
          let spanCol = computedProps.visibleColumns[spanColIndex + 1];
          if (!spanCol) {
            break;
          }

          if (spanCol.computedLocked !== col.computedLocked) {
            break;
          }
          computedWidth += spanCol.computedWidth;

          colspanned[spanCol.id] = true;
          spanColIndex++;
          lastIndexForCurrentColumn++;
          remainingColumns--;
        }
      }

      const last = lastIndexForCurrentColumn === array.length - 1;
      const firstInSection =
        index === 0 ||
        index === firstUnlockedIndex ||
        index === firstLockedEndIndex;

      const lastInSection =
        lastIndexForCurrentColumn === lastLockedStartIndex ||
        lastIndexForCurrentColumn === lastUnlockedIndex ||
        last;

      const showBorderRight =
        lastIndexForCurrentColumn === lastLockedStartIndex;

      const showBorderLeft = computedProps.showVerticalCellBorders
        ? index !== 0 && index !== firstUnlockedIndex
        : index === firstLockedEndIndex;
      return (
        <LockedRowCell
          key={col.id}
          row={row}
          last={last}
          rtl={rtl}
          first={index === 0}
          firstInSection={firstInSection}
          lastInSection={lastInSection}
          showBorderBottom={showBorderBottom}
          showBorderRight={rtl ? showBorderLeft : showBorderRight}
          showBorderLeft={rtl ? showBorderRight : showBorderLeft}
          rowIndex={rowIndex}
          columnIndex={index}
          rowPosition={position}
          column={col}
          computedWidth={computedWidth}
          computedProps={computedProps}
        />
      );
    }
  );

  cells = renderCellsMaybeLocked(cells, row, computedProps);

  const firstInSection = rowIndex === 0;
  const lastInSection = rowIndex === rows.length - 1;

  let lockedRowStyle = {
    minWidth: computedProps.minRowWidth,
  };

  if (computedProps.lockedRowStyle) {
    if (typeof computedProps.lockedRowStyle === 'function') {
      let result = computedProps.lockedRowStyle(
        {
          style: lockedRowStyle,
          row,
          rowIndex,
          firstInSection,
          lastInSection,
        },
        computedProps
      );
      if (result !== undefined) {
        lockedRowStyle = { ...lockedRowStyle, ...result };
      }
    } else {
      lockedRowStyle = { ...lockedRowStyle, ...computedProps.lockedRowStyle };
    }
  }

  let cls = '';

  if (computedProps.lockedRowClassName) {
    if (typeof computedProps.lockedRowClassName === 'function') {
      cls =
        computedProps.lockedRowClassName(
          {
            style: lockedRowStyle,
            row,
            rowIndex,
            firstInSection,
            lastInSection,
          },
          computedProps
        ) || '';
    } else {
      cls = computedProps.lockedRowClassName || '';
    }
  }

  const showBorderBottom =
    computedProps.showHorizontalCellBorders && !lastInSection;

  return (
    <div
      key={id}
      style={lockedRowStyle}
      className={join(
        cls,
        defaultClassName,
        `${defaultClassName}--position-${row.position}`,
        firstInSection && `${defaultClassName}--first-in-section`,
        showBorderBottom && `${defaultClassName}--show-border-bottom`,
        lastInSection && `${defaultClassName}--last-in-section`
      )}
    >
      {cells}
    </div>
  );
};
export default ({
  rows,
  position,
  style,
  children,
}: {
  style: any;
  children: JSX.Element;
  rows: TypeLockedRow[];
  position: 'start' | 'end';
}): ReactNode => {
  const computedProps: TypeComputedProps = useContext<TypeComputedProps>(
    GridContext
  );
  return (
    <div
      style={{
        ...style,
        overflow: 'hidden',
        maxWidth: computedProps.viewportAvailableWidth,
      }}
      className={join(
        `InovuaReactDataGrid__locked-rows-container InovuaReactDataGrid__locked-rows-container--position-${position}`,
        computedProps.nativeScroll &&
          computedProps.scrollbars.vertical &&
          `InovuaReactDataGrid__locked-rows-container--show-border-right`
      )}
    >
      <div className={`InovuaReactDataGrid__locked-rows-container-scroller`}>
        {rows.map((row, i) =>
          renderLockedRow(row, i, rows, computedProps, position)
        )}
      </div>
      {children}
    </div>
  );
};
